package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (as *Server) Health(c *gin.Context) {
	JSONResponse(c, Response{Success: true, Message: OkMessage}, nil, http.StatusOK)
}
