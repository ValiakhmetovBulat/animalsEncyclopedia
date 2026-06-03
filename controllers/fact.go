package controllers

import (
	log "animalsEncyclopedia/logger"
	"animalsEncyclopedia/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (as *Server) GetFactsByAnimalId(c *gin.Context) {
	animalId, err := GetIntQueryByName(c, "animalId")
	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "animalId is not set or incorrect",
			},
			err,
			http.StatusBadRequest,
		)
		return
	}

	facts, err := models.GetFactsByAnimalId(int64(animalId))

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
			Data:    facts,
		},
		err,
		http.StatusOK,
	)
	return
}

func (as *Server) GetFactsPaginated(c *gin.Context) {
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

	facts, total, err := models.GetFactsPaginated(page, limit)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get facts",
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
				Data:  facts,
			},
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) PostFact(c *gin.Context) {
	var fact models.Fact

	err := c.ShouldBind(&fact)

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

	err = models.AddFact(&fact)

	if err != nil {
		resp := Response{
			Success: false,
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			resp.Message = "related animal not found"

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

func (as *Server) UpdateFact(c *gin.Context) {
	var fact models.Fact

	err := c.ShouldBind(&fact)

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

	_, err = models.GetFactById(fact.Id)

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

	err = models.UpdateFact(&fact)

	if err != nil {
		resp := Response{
			Success: false,
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			resp.Message = "related animal not found"

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

func (as *Server) DeleteFact(c *gin.Context) {
	factId, err := GetIntQueryByName(c, "id")

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

	_, err = models.GetFactById(int64(factId))

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

	err = models.DeleteFact(int64(factId))

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
