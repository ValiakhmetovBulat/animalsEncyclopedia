package config

import (
	log "animalsEncyclopedia/logger"
	"encoding/json"
	"os"
)

type Config struct {
	ServerName     string         `json:"server_name"`
	Version        string         `json:"version"`
	ServerConfig   ServerConfig   `json:"server_config"`
	DatabaseConfig DatabaseConfig `json:"db_config"`
	LoggerConfig   *log.Config    `json:"logger_config"`
}

type ServerConfig struct {
	FrontendDistPath string   `json:"frontend_dist_path"`
	ListenUrl        string   `json:"listen_url"`
	UseTLS           bool     `json:"use_tls"`
	CertPath         string   `json:"cert_path"`
	KeyPath          string   `json:"key_path"`
	TrustedOrigins   []string `json:"trusted_origins"`
	AssetStoragePath string   `json:"asset_storage_path"`
}

type DatabaseConfig struct {
	Host       string `json:"host"`
	Port       int    `json:"port"`
	DbName     string `json:"db_name"`
	DbUser     string `json:"db_user"`
	DbPassword string `json:"db_password"`
	SslMode    string `json:"ssl_mode"`
	Timezone   string `json:"timezone"`
}

func LoadConfig(path string) (*Config, error) {
	configFile, err := os.ReadFile(path)

	if err != nil {
		return nil, err
	}

	config := &Config{}

	err = json.Unmarshal(configFile, config)

	if err != nil {
		return nil, err
	}

	return config, nil
}
