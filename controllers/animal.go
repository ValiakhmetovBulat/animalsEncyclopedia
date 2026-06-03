package controllers

import (
	log "animalsEncyclopedia/logger"
	"animalsEncyclopedia/models"
	"animalsEncyclopedia/util"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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

type AnimalDto struct {
	Id          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	TypeId      int64  `json:"type_id"`
	CountryId   int64  `json:"country_id"`
	BreedId     int64  `json:"breed_id"`
	ImageLink   string `json:"image_link"`
	NewImage    string `json:"new_image"`
}

func (as *Server) PostAnimal(c *gin.Context) {
	var animalDto AnimalDto

	err := c.ShouldBind(&animalDto)

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

	if animalDto.NewImage != "" {
		fileName, err := util.SaveBase64Image(
			animalDto.NewImage,
			"./static/assets",
		)

		if err != nil {
			JSONResponse(
				c,
				Response{
					Success: false,
					Message: "failed to save image",
				},
				err,
				http.StatusBadRequest,
			)
			return
		}

		animalDto.ImageLink = fileName
	}

	animalToCreate := models.Animal{
		Id:          animalDto.Id,
		Name:        animalDto.Name,
		Description: animalDto.Description,
		TypeId:      animalDto.TypeId,
		CountryId:   animalDto.CountryId,
		BreedId:     animalDto.BreedId,
		ImageLink:   animalDto.ImageLink,
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

func (as *Server) UpdateAnimal(c *gin.Context) {
	var animalDto AnimalDto

	err := c.ShouldBind(&animalDto)

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

	oldAnimal, err := models.GetAnimalById(animalDto.Id)

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

	if animalDto.NewImage != "" {
		fileName, err := util.SaveBase64Image(
			animalDto.NewImage,
			"./static/assets",
		)

		if err != nil {
			JSONResponse(
				c,
				Response{
					Success: false,
					Message: "failed to save image",
				},
				err,
				http.StatusBadRequest,
			)
			return
		}

		animalDto.ImageLink = fileName
	}

	if animalDto.NewImage != "" || animalDto.ImageLink == "" {
		if strings.TrimSpace(oldAnimal.ImageLink) != "" {
			_ = util.DeleteImage("./static/assets", oldAnimal.ImageLink)
		}
	}

	animalToUpdate := models.Animal{
		Id:          animalDto.Id,
		Name:        animalDto.Name,
		Description: animalDto.Description,
		TypeId:      animalDto.TypeId,
		CountryId:   animalDto.CountryId,
		BreedId:     animalDto.BreedId,
		ImageLink:   animalDto.ImageLink,
	}

	err = models.UpdateAnimal(&animalToUpdate)

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

func (as *Server) DeleteAnimal(c *gin.Context) {
	animalId, err := GetIntQueryByName(c, "id")

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

	animalToDelete, err := models.GetAnimalById(int64(animalId))

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

	err = models.DeleteAnimal(int64(animalId))

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

	if strings.TrimSpace(animalToDelete.ImageLink) != "" {
		_ = util.DeleteImage("./static/assets", animalToDelete.ImageLink)
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
