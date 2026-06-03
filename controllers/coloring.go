package controllers

import (
	log "animalsEncyclopedia/logger"
	"animalsEncyclopedia/models"
	"net/http"

	"github.com/gin-gonic/gin"
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
