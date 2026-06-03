package middleware

import (
	"animalsEncyclopedia/auth"
	"animalsEncyclopedia/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func ApplySecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		csp := "frame-ancestors 'none';"
		c.Writer.Header().Set("Content-Security-Policy", csp)
		c.Writer.Header().Set("X-Frame-Options", "DENY")
		c.Next()
	}
}

func CorsMiddleware(trustedOrigins []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if origin != "" {
			allowed := len(trustedOrigins) == 0
			if !allowed {
				for _, trusted := range trustedOrigins {
					if origin == trusted {
						allowed = true
						break
					}
				}
			}
			if allowed {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			}
			c.Writer.Header().Set("Vary", "Origin")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func RequireAPIKey() gin.HandlerFunc {
	return func(c *gin.Context) {
		ak := auth.GetApiKeyFromContext(c)

		if ak == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "API Key not set",
				"success": false,
			})
			c.Abort()
			return
		}

		u, err := models.GetUserByApiKey(ak)
		if err != nil || u.ApiKeyExpiresAt.Before(time.Now()) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid API Key",
				"success": false,
			})
			c.SetCookie(auth.CookieName, "", -1, "/", "", c.Request.TLS != nil, true)
			c.Abort()
			return
		}

		c.Set("user", u)
		c.Set("user_id", u.Id)
		c.Set(auth.CookieName, ak)

		c.Next()
	}
}

func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid, exists := c.Get("user_id")

		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid user",
				"success": false,
			})
			c.Abort()
			return
		}

		userId, ok := uid.(int64)

		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid user",
				"success": false,
			})
			c.SetCookie(auth.CookieName, "", -1, "/", "", c.Request.TLS != nil, true)
			c.Abort()
			return
		}

		u, err := models.GetUserById(userId)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Unknown user",
				"success": false,
			})
			c.Abort()
			return
		}

		if u.Role.Slug == models.AdminRole {
			c.Next()
		}
	}
}
