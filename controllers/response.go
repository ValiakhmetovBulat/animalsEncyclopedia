package controllers

import (
	log "animalsEncyclopedia/logger"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
	Error   string      `json:"error"`
}

const BadRequestMessage = "invalid request format"
const NotFoundMessage = "not found"
const UnauthorizedMessage = "unauthorized"
const ServerErrorMessage = "server error"
const ConflictMessage = "conflict"
const OkMessage = "ok"

func JSONResponse(c *gin.Context, response Response, err error, statusCode int) {
	if err != nil {
		log.Error(err)
		response.Error = err.Error()
	}

	c.JSON(statusCode, response)
}

type PaginatedResponse struct {
	Total int64       `json:"total"`
	Data  interface{} `json:"data"`
}
