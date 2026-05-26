package controllers

import (
	"animalsEncyclopedia/config"
	log "animalsEncyclopedia/logger"
	"animalsEncyclopedia/middleware"
	"animalsEncyclopedia/ratelimit"
	"animalsEncyclopedia/util"
	"context"
	"crypto/tls"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type Server struct {
	engine  *gin.Engine
	server  *http.Server
	config  config.ServerConfig
	limiter *ratelimit.PostLimiter
}

type ServerOption func(*Server)

var defaultTLSConfig = &tls.Config{
	PreferServerCipherSuites: true,
	CurvePreferences: []tls.CurveID{
		tls.X25519,
		tls.CurveP256,
	},
	MinVersion: tls.VersionTLS12,
	CipherSuites: []uint16{
		tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
		tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
		tls.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,
		tls.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,
		tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
		tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,

		// Kept for backwards compatibility with some clients
		tls.TLS_RSA_WITH_AES_256_GCM_SHA384,
		tls.TLS_RSA_WITH_AES_128_GCM_SHA256,
	},
}

func NewServer(config config.ServerConfig, options ...ServerOption) *Server {
	defaultEngine := gin.Default()

	defaultLimiter := ratelimit.NewPostLimiter()

	as := &Server{
		engine:  defaultEngine,
		config:  config,
		limiter: defaultLimiter,
	}
	for _, opt := range options {
		opt(as)
	}

	as.server = &http.Server{
		Addr:    as.config.ListenUrl,
		Handler: as.engine,
	}

	as.registerRoutes()
	return as
}

func (as *Server) Start() {
	if as.config.UseTLS {
		// Only support TLS 1.2 and above
		as.server.TLSConfig = defaultTLSConfig
		err := util.CheckAndCreateSSL(as.config.CertPath, as.config.KeyPath)
		if err != nil {
			log.Fatal(err)
		}
		log.Infof("Starting admin server at https://%s", as.config.ListenUrl)
		log.Fatal(as.server.ListenAndServeTLS(as.config.CertPath, as.config.KeyPath))
	} else {
		// If TLS isn't configured, just listen on HTTP
		log.Infof("Starting admin server at http://%s", as.config.ListenUrl)
		log.Fatal(as.server.ListenAndServe())
	}
}

func (as *Server) registerRoutes() {
	as.engine.Use(middleware.CorsMiddleware(as.config.TrustedOrigins))
	as.engine.Use(middleware.ApplySecurityHeaders())

	as.engine.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	as.engine.Static("/static", "./static/assets")

	api := as.engine.Group("/api")
	{
		api.GET("/health", as.Health)

		animals := api.Group("/animals")
		{
			animals.GET("", as.GetAnimalsPaginated)
			animals.GET("/options", as.GetAnimalOptions)
		}

		facts := api.Group("/facts")
		{
			facts.GET("", as.GetFactsByAnimalId)
			facts.GET("/paginated", as.GetFactsPaginated)
		}

		breeds := api.Group("/breeds")
		{
			breeds.GET("", as.GetBreeds)
			breeds.GET("/paginated", as.GetBreedsPaginated)
			breeds.GET("/options", as.GetBreedOptions)
		}

		types := api.Group("/types")
		{
			types.GET("", as.GetTypes)
			types.GET("/paginated", as.GetTypesPaginated)
			types.GET("/options", as.GetTypeOptions)
		}

		countries := api.Group("/countries")
		{
			countries.GET("", as.GetCountries)
			countries.POST("", as.PostCountry)
			countries.GET("/paginated", as.GetCountriesPaginated)
			countries.GET("/options", as.GetCountryOptions)
		}

		colorings := api.Group("/colorings")
		{
			colorings.GET("/paginated", as.GetColoringsPaginated)
			colorings.GET("", as.GetColoringsByBreedId)
		}

		auth := api.Group("/auth")
		auth.Use(middleware.RequireAPIKey())
		{
			auth.POST("/logout", as.Logout)
			auth.GET("/me", as.CheckUser)
		}

		api.POST("login", as.LoginUser)

		admin := api.Group("/admin")
		admin.Use(middleware.RequireAPIKey())
		admin.Use(middleware.RequireAdmin())
		{
			adminFacts := admin.Group("/facts")
			{
				adminFacts.POST("", as.PostFact)
				adminFacts.PUT("", as.UpdateFact)
				adminFacts.DELETE("", as.DeleteFact)
			}

			adminCountries := admin.Group("/countries")
			{
				adminCountries.POST("", as.PostCountry)
				adminCountries.PUT("", as.UpdateCountry)
				adminCountries.DELETE("", as.DeleteCountry)
			}

			adminTypes := admin.Group("/types")
			{
				adminTypes.POST("", as.PostType)
				adminTypes.PUT("", as.UpdateType)
				adminTypes.DELETE("", as.DeleteType)
			}

			adminBreeds := admin.Group("/breeds")
			{
				adminBreeds.POST("", as.PostBreed)
				adminBreeds.PUT("", as.UpdateBreed)
				adminBreeds.DELETE("", as.DeleteBreed)
			}
		}
	}
}

func (as *Server) Shutdown() error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	return as.server.Shutdown(ctx)
}
