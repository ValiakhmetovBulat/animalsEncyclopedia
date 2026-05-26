package models

import (
	"animalsEncyclopedia/auth"
	"animalsEncyclopedia/config"
	log "animalsEncyclopedia/logger"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormLogger "gorm.io/gorm/logger"
)

var db *gorm.DB
var conf *config.Config

var (
	ErrAdminAlreadyExists = errors.New("admin already exists")
)

const MaxDatabaseConnectionAttempts int = 10
const DefaultAdminUsername = "admin"
const UserRole = "user"
const AdminRole = "admin"

var DefaultRoles = []Role{
	{
		Slug:        AdminRole,
		Name:        AdminRole,
		Description: "Администратор системы.",
	},
}

func buildConnectionString(dbConfig *config.DatabaseConfig, dbName string) string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s TimeZone=%s",
		dbConfig.Host,
		dbConfig.DbUser,
		dbConfig.DbPassword,
		dbName,
		dbConfig.Port,
		dbConfig.SslMode,
		dbConfig.Timezone,
	)
}

func quoteIdent(name string) string {
	return `"` + strings.ReplaceAll(name, `"`, `""`) + `"`
}

func gormConfig() *gorm.Config {
	return &gorm.Config{
		Logger: gormLogger.Default.LogMode(gormLogger.Silent),
	}
}

func Connect(c *config.Config) (*gorm.DB, error) {
	conf = c

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = buildConnectionString(&c.DatabaseConfig, c.DatabaseConfig.DbName)
	}

	i := 0
	for {
		var err error
		db, err = gorm.Open(postgres.Open(dsn), gormConfig())
		if err == nil {
			return db, nil
		}
		if i >= MaxDatabaseConnectionAttempts {
			log.Errorf("error connecting to database: %v", err)
			return nil, err
		}
		i++
		log.Warn("waiting for database to be up...")
		time.Sleep(5 * time.Second)
	}
}

func EnsureDatabaseExists(c *config.Config) error {
	dbName := c.DatabaseConfig.DbName
	adminDsn := buildConnectionString(&c.DatabaseConfig, "postgres")
	adminDb, err := gorm.Open(postgres.Open(adminDsn), gormConfig())
	if err != nil {
		return err
	}
	sqlDB, err := adminDb.DB()
	if err != nil {
		return err
	}
	defer sqlDB.Close()

	var exists bool
	if err := adminDb.Raw("SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ?)", dbName).Scan(&exists).Error; err != nil {
		return err
	}
	if exists {
		return nil
	}

	return adminDb.Exec("CREATE DATABASE " + quoteIdent(dbName)).Error
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&Role{},
		&User{},
		&Animal{},
		&Breed{},
		&Coloring{},
		&Country{},
		&Fact{},
		&Type{},
	)
}

func Setup(c *config.Config) (*gorm.DB, error) {
	conf = c
	if err := EnsureDatabaseExists(c); err != nil {
		return nil, err
	}
	db, err := Connect(c)
	if err != nil {
		return nil, err
	}
	if err := AutoMigrate(db); err != nil {
		return nil, err
	}
	return db, nil
}

func DB() *gorm.DB {
	return db
}

func Close() error {
	if db == nil {
		return nil
	}
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

func SetupRoles() error {
	for _, role := range DefaultRoles {
		r, err := GetRoleBySlug(role.Slug)

		if errors.Is(err, gorm.ErrRecordNotFound) {
			err = db.Save(&role).Error

			if err != nil {
				return err
			}
		} else if err != nil {
			return err
		}

		if r != nil {
			log.Warnf("role already exists: %s", r.Slug)
		}
	}

	return nil
}

func SetupAdminUser(password string) error {
	user, err := GetUserByUsername(DefaultAdminUsername)

	if errors.Is(err, gorm.ErrRecordNotFound) {
		adminRole, err := GetRoleBySlug(AdminRole)

		if err != nil {
			log.Errorf("error getting admin role: %v", err)
			return err
		}

		err = auth.CheckPasswordPolicy(password)

		if err != nil {
			return err
		}

		hash, err := auth.GeneratePasswordHash(password)

		if err != nil {
			return err
		}

		user = User{
			Username:        DefaultAdminUsername,
			Email:           "admin@example.com",
			Hash:            hash,
			RoleId:          adminRole.Id,
			LastLogin:       time.Now(),
			ApiKeyExpiresAt: time.Now(),
			ApiKey:          auth.GenerateSecureKey(auth.APIKeyLength),
		}

		err = db.Save(&user).Error

		if err != nil {
			log.Errorf("error saving admin user: %v", err)
			return err
		}

		return nil
	} else if err != nil {
		log.Error(err)
		return err
	}

	return ErrAdminAlreadyExists
}
