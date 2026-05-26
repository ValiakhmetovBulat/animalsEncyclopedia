package controllers

import (
	log "animalsEncyclopedia/logger"
	"animalsEncyclopedia/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (as *Server) GetAnimalsPaginated(c *gin.Context) {
	typeId, err := GetIntQueryByName(c, "type")
	if err != nil {
		log.Error(err)

		typeId = 0
	}

	breedId, err := GetIntQueryByName(c, "breed")
	if err != nil {
		log.Error(err)

		breedId = 0
	}

	countryId, err := GetIntQueryByName(c, "country")
	if err != nil {
		log.Error(err)

		countryId = 0
	}

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

	search := c.Query("search")

	animals, total, err := models.GetAnimalsPaginated(page, limit, typeId, breedId, countryId, search)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get animals",
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
				Data:  animals,
			},
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) GetAnimalOptions(c *gin.Context) {
	ao, err := models.GetAnimalOptions()

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get animal options",
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
			Data:    ao,
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) AddAnimal(c *gin.Context) {
	var animalToCreate models.Animal

	err := c.ShouldBind(&animalToCreate)

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

	err = models.PostAnimal(&animalToCreate)

	if err != nil {
		resp := Response{
			Success: false,
		}

		if errors.As(err, &models.AnimalValidationError{}) {
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
