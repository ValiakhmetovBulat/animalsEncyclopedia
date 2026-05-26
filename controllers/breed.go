package controllers

import (
	log "animalsEncyclopedia/logger"
	"animalsEncyclopedia/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (as *Server) GetBreeds(c *gin.Context) {
	breeds, err := models.GetBreeds()

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get animals' breeds",
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
			Data:    breeds,
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) GetBreedsByTypeId(c *gin.Context) {
	typeId, err := GetIntQueryByName(c, "type")
	if err != nil {
		log.Error(err)

		typeId = 0
	}

	breeds, err := models.GetBreedsByTypeId(typeId)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get animals' breeds",
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
			Data:    breeds,
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) GetBreedsPaginated(c *gin.Context) {
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

	breeds, total, err := models.GetBreedsPaginated(page, limit)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get breeds",
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
				Data:  breeds,
			},
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) PostBreed(c *gin.Context) {
	var breedToCreate models.Breed

	err := c.ShouldBind(&breedToCreate)

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

	err = models.PostBreed(&breedToCreate)

	if err != nil {
		resp := Response{
			Success: false,
		}

		if errors.As(err, &models.BreedValidationError{}) {
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

func (as *Server) UpdateBreed(c *gin.Context) {
	var breed models.Breed

	err := c.ShouldBind(&breed)

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

	_, err = models.GetBreedById(breed.Id)

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

	err = models.UpdateBreed(&breed)

	if err != nil {
		resp := Response{
			Success: false,
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			resp.Message = "related type not found"

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

func (as *Server) DeleteBreed(c *gin.Context) {
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

	_, err = models.GetBreedById(int64(factId))

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

	err = models.DeleteBreed(int64(factId))

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

func (as *Server) GetBreedOptions(c *gin.Context) {
	typeId, err := GetIntQueryByName(c, "id")

	if err != nil {
		typeId = 0
	}

	var to []models.BreedOption

	if typeId == 0 {
		to, err = models.GetBreedOptions()
	} else {
		to, err = models.GetBreedOptionsWithTypeId(typeId)
	}

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get breed options",
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
