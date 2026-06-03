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

func (as *Server) GetColoringsPaginated(c *gin.Context) {
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

	colorings, total, err := models.GetColoringsPaginated(page, limit)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get colorings",
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
				Data:  colorings,
			},
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) GetColoringsByBreedId(c *gin.Context) {
	breedId, err := GetIntQueryByName(c, "breed_id")

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "breed_id is incorrect or not provided",
			},
			err,
			http.StatusBadRequest,
		)
		return
	}

	colorings, err := models.GetColoringsByBreedId(int64(breedId))

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
			Data:    colorings,
		},
		nil,
		http.StatusOK,
	)
	return
}

type ColoringDto struct {
	Id        int64  `json:"id"`
	Name      string `json:"name"`
	ImageLink string `json:"image_link"`
	BreedId   int64  `json:"breed_id"`
	NewImage  string `json:"new_image"`
}

func (as *Server) PostColoring(c *gin.Context) {
	var coloringDto ColoringDto

	err := c.ShouldBind(&coloringDto)

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

	if coloringDto.NewImage != "" {
		fileName, err := util.SaveBase64Image(
			coloringDto.NewImage,
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

		coloringDto.ImageLink = fileName
	}

	coloring := models.Coloring{
		Id:        coloringDto.Id,
		Name:      coloringDto.Name,
		ImageLink: coloringDto.ImageLink,
		BreedId:   coloringDto.BreedId,
	}

	err = models.AddColoring(&coloring)

	if err != nil {
		resp := Response{
			Success: false,
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			resp.Message = "related breed not found"

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

func (as *Server) UpdateColoring(c *gin.Context) {
	var coloringDto ColoringDto

	err := c.ShouldBind(&coloringDto)

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

	oldColoring, err := models.GetColoringById(coloringDto.Id)

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

	if coloringDto.NewImage != "" {
		fileName, err := util.SaveBase64Image(
			coloringDto.NewImage,
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

		coloringDto.ImageLink = fileName
	}

	if coloringDto.NewImage != "" || coloringDto.ImageLink == "" {
		if strings.TrimSpace(oldColoring.ImageLink) != "" {
			_ = util.DeleteImage("./static/assets", oldColoring.ImageLink)
		}
	}

	coloringToUpdate := models.Coloring{
		Id:        coloringDto.Id,
		Name:      coloringDto.Name,
		ImageLink: coloringDto.ImageLink,
		BreedId:   coloringDto.BreedId,
	}

	err = models.UpdateColoring(&coloringToUpdate)

	if err != nil {
		resp := Response{
			Success: false,
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			resp.Message = "related breed not found"

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

func (as *Server) DeleteColoring(c *gin.Context) {
	coloringId, err := GetIntQueryByName(c, "id")

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

	coloringToDelete, err := models.GetColoringById(int64(coloringId))

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

	err = models.DeleteColoring(int64(coloringId))

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

	if strings.TrimSpace(coloringToDelete.ImageLink) != "" {
		_ = util.DeleteImage("./static/assets", coloringToDelete.ImageLink)
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
