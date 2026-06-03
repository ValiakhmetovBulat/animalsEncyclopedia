package controllers

import (
	"animalsEncyclopedia/auth"
	_ "animalsEncyclopedia/logger"
	log "animalsEncyclopedia/logger"
	"animalsEncyclopedia/models"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Username        string      `json:"username"`
	ApiKeyExpiresAt time.Time   `json:"api_key_expires_at"`
	Email           string      `json:"email"`
	Role            models.Role `json:"role"`
}

var ErrInvalidUsernameOrPassword = errors.New("invalid username or password")

func (as *Server) LoginUser(c *gin.Context) {
	lr := &LoginRequest{}
	err := c.ShouldBind(lr)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: ErrInvalidJSON,
			},
			err,
			http.StatusBadRequest,
		)
		return
	}

	user, err := models.GetUserByUsername(lr.Username)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: UnauthorizedMessage,
			},
			ErrInvalidUsernameOrPassword,
			http.StatusUnauthorized,
		)
		return
	}

	err = auth.ValidatePassword(lr.Password, user.Hash)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: UnauthorizedMessage,
			},
			ErrInvalidUsernameOrPassword,
			http.StatusUnauthorized,
		)
		return
	}

	user.ApiKeyExpiresAt = time.Now().Add(auth.APIKeyExpireTime)

	if user.ApiKeyExpiresAt.Before(time.Now()) || len(user.ApiKey) == 0 {
		user.ApiKey = auth.GenerateSecureKey(auth.APIKeyLength)
	}

	user.LastLogin = time.Now().UTC()
	err = models.PutUser(user.Id, &user)
	if err != nil {
		log.Error(err)
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: ServerErrorMessage,
			},
			err,
			http.StatusInternalServerError,
		)
		return
	}

	if as.config.UseTLS {
		c.SetSameSite(http.SameSiteNoneMode)
	} else {
		c.SetSameSite(http.SameSiteLaxMode)
	}
	c.SetCookie(auth.CookieName, user.ApiKey, int(user.ApiKeyExpiresAt.Sub(time.Now()).Seconds()), "/", "", as.config.UseTLS, true)

	JSONResponse(
		c,
		Response{
			Success: true,
			Message: "login success",
			Data: LoginResponse{
				Username:        user.Username,
				ApiKeyExpiresAt: user.ApiKeyExpiresAt,
				Email:           user.Email,
				Role:            user.Role,
			},
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) Logout(c *gin.Context) {
	ak := c.GetString(auth.CookieName)

	if ak == "" {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: UnauthorizedMessage,
			},
			nil,
			http.StatusUnauthorized)
		return
	}

	u, err := models.GetUserByApiKey(ak)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: UnauthorizedMessage,
			},
			err,
			http.StatusUnauthorized)
		return
	}

	if as.config.UseTLS {
		c.SetSameSite(http.SameSiteNoneMode)
	} else {
		c.SetSameSite(http.SameSiteLaxMode)
	}
	c.SetCookie(auth.CookieName, "", -1, "/", "", true, true)

	u.ApiKeyExpiresAt = time.Date(0, 0, 0, 0, 0, 0, 0, time.UTC)

	err = models.PutUser(u.Id, &u)

	if err != nil {
		log.Error(err)
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: ServerErrorMessage,
			},
			err,
			http.StatusInternalServerError,
		)
		return
	}

	JSONResponse(
		c,
		Response{
			Success: true,
			Message: "successfully logged out",
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) CheckUser(c *gin.Context) {
	ak := c.GetString(auth.CookieName)

	if ak == "" {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: UnauthorizedMessage,
			},
			nil,
			http.StatusUnauthorized)
		return
	}

	u, err := models.GetUserByApiKey(ak)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: UnauthorizedMessage,
			},
			err,
			http.StatusUnauthorized)
		return
	}

	JSONResponse(
		c,
		Response{
			Success: true,
			Message: OkMessage,
			Data: LoginResponse{
				Username:        u.Username,
				ApiKeyExpiresAt: u.ApiKeyExpiresAt,
				Email:           u.Email,
				Role:            u.Role,
			},
		},
		nil,
		http.StatusOK,
	)
	return
}

func GetUidFromContext(c *gin.Context) (uid int64, err error) {
	ui, exists := c.Get("user_id")

	if !exists {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: UnauthorizedMessage,
			},
			nil,
			http.StatusUnauthorized,
		)
		return
	}

	userId, ok := ui.(int64)

	if !ok {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "uid in context must be int64",
			},
			nil,
			http.StatusInternalServerError,
		)
		return
	}

	return userId, nil
}
