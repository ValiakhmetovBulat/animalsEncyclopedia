package controllers

import (
	log "animalsEncyclopedia/logger"
	"animalsEncyclopedia/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (as *Server) GetCountries(c *gin.Context) {
	countries, err := models.GetCountries()

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get animals' countries",
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
			Data:    countries,
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) PostCountry(c *gin.Context) {
	var countryToCreate models.Country

	err := c.ShouldBind(&countryToCreate)

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

	err = models.AddCountry(&countryToCreate)

	if err != nil {
		resp := Response{
			Success: false,
		}

		if errors.As(err, &models.CountryValidationError{}) {
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

func (as *Server) GetCountriesPaginated(c *gin.Context) {
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

	countries, total, err := models.GetCountriesPaginated(page, limit)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get countries",
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
				Data:  countries,
			},
		},
		nil,
		http.StatusOK,
	)
	return
}

func (as *Server) UpdateCountry(c *gin.Context) {
	var country models.Country

	err := c.ShouldBind(&country)

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

	_, err = models.GetCountryById(country.Id)

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

	err = models.UpdateCountry(&country)

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

func (as *Server) DeleteCountry(c *gin.Context) {
	countryId, err := GetIntQueryByName(c, "id")

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

	_, err = models.GetCountryById(int64(countryId))

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

	err = models.DeleteCountry(int64(countryId))

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

func (as *Server) GetCountryOptions(c *gin.Context) {
	co, err := models.GetCountryOptions()

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: "cannot get country options",
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
			Data:    co,
		},
		nil,
		http.StatusOK,
	)
	return
}
