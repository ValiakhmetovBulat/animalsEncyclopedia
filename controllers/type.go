package controllers

import (
	log "animalsEncyclopedia/logger"
	"animalsEncyclopedia/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (as *Server) GetTypes(c *gin.Context) {
	types, err := models.GetTypes()

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get animals' types",
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
			Message: OkMessage,
			Data:    types,
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) PostType(c *gin.Context) {
	var typeToCreate models.Type

	err := c.ShouldBind(&typeToCreate)

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

	err = models.PostType(&typeToCreate)

	if err != nil {
		resp := Response{
			Success: false,
		}

		if errors.As(err, &models.TypeValidationError{}) {
			resp.Message = err.Error()

			JSONResponse(
				c,
				resp,
				err,
				http.StatusBadRequest,
			)
			return
		}

		resp.Message = ServerErrorMessage

		JSONResponse(
			c,
			resp,
			err,
			http.StatusInternalServerError,
		)
		return
	}

	JSONResponse(
		c,
		Response{
			Success: true,
			Message: OkMessage,
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) GetTypesPaginated(c *gin.Context) {
	page, err := GetIntQueryByName(c, "page")
	if err != nil {
		log.Error(err)

		page = 1
	}

	limit, err := GetIntQueryByName(c, "limit")
	if err != nil {
		log.Error(err)

		limit = 10
	}

	types, total, err := models.GetTypesPaginated(page, limit)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get types",
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
			Message: OkMessage,
			Data: PaginatedResponse{
				Total: total,
				Data:  types,
			},
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) UpdateType(c *gin.Context) {
	var t models.Type

	err := c.ShouldBind(&t)

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

	_, err = models.GetTypeById(t.Id)

	if err != nil {
		resp := Response{
			Success: false,
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			resp.Message = NotFoundMessage

			JSONResponse(
				c,
				resp,
				err,
				http.StatusNotFound,
			)

			return
		}

		resp.Message = ServerErrorMessage

		JSONResponse(
			c,
			resp,
			err,
			http.StatusInternalServerError,
		)
		return
	}

	err = models.UpdateType(&t)

	if err != nil {
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
			Message: OkMessage,
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) DeleteType(c *gin.Context) {
	tId, err := GetIntQueryByName(c, "id")

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "param id is invalid",
			},
			err,
			http.StatusBadRequest,
		)
		return
	}

	_, err = models.GetTypeById(int64(tId))

	if err != nil {
		resp := Response{
			Success: false,
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			resp.Message = NotFoundMessage

			JSONResponse(
				c,
				resp,
				err,
				http.StatusNotFound,
			)
			return
		}

		resp.Message = ServerErrorMessage

		JSONResponse(
			c,
			resp,
			err,
			http.StatusInternalServerError,
		)
		return
	}

	err = models.DeleteType(int64(tId))

	if err != nil {
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
			Message: OkMessage,
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) GetTypeOptions(c *gin.Context) {
	to, err := models.GetTypeOptions()

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get type options",
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
			Message: OkMessage,
			Data:    to,
		},
		nil,
		http.StatusOK,
	)
	return
}
