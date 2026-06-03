package main

import (
	"animalsEncyclopedia/config"
	"animalsEncyclopedia/controllers"
	log "animalsEncyclopedia/logger"
	"animalsEncyclopedia/models"
	"errors"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/alecthomas/kingpin/v2"
	"golang.org/x/crypto/ssh/terminal"
)

var (
	configPath   = kingpin.Flag("config", "location of config.json").Short('c').Default("config.json").String()
	isAdminSetup = kingpin.Flag("setup-admin", "setup admin user and default roles").Default("false").Bool()
)

var (
	ErrPasswordsNotMatch = errors.New("passwords do not match")
)

func main() {
	kingpin.CommandLine.HelpFlag.Short('h')
	kingpin.Parse()

	log.Infof("system started at %s", time.Now())

	log.Infof("config path: %s", *configPath)

	conf, err := config.LoadConfig(*configPath)

	if err != nil {
		log.Errorf("load config error: %v", err)
		return
	}

	log.Info("config loaded")

	err = log.Setup(conf.LoggerConfig)

	log.Infof("logger setup complete")

	if err != nil {
		log.Errorf("setup logger error: %v", err)
		return
	}

	if _, err := models.Setup(conf); err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}

	if *isAdminSetup {
		setupAdminUser()
		return
	}

	var serverOptions []controllers.ServerOption

	serverConfig := conf.ServerConfig
	server := controllers.NewServer(serverConfig, serverOptions...)

	go server.Start()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c
	log.Infof("CTRL+C received, shutting down")

	err = server.Shutdown()
}

func setupAdminUser() {
	log.Info("admin user and roles setup started")
	fmt.Print("enter password:")
	bytePassword, err := terminal.ReadPassword(int(syscall.Stdin))

	if err != nil {
		log.Fatalf("failed to read password: %v", err)
		return
	}

	fmt.Println()

	fmt.Print("re-enter password:")
	byteRePassword, err := terminal.ReadPassword(int(syscall.Stdin))

	fmt.Println()

	if err != nil {
		log.Fatalf("failed to read re password: %v", err)
		return
	}

	if string(bytePassword) != string(byteRePassword) {
		log.Error(ErrPasswordsNotMatch)
		return
	}

	err = models.SetupRoles()
	if err != nil {
		log.Fatalf("failed to setup roles: %v", err)
		return
	}

	err = models.SetupAdminUser((string)(bytePassword))

	if err != nil {
		log.Fatalf("failed to setup admin user: %v", err)
		return
	}

	log.Info("admin user and roles setup completed")
}
