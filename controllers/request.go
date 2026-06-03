package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetIntQueryByName(c *gin.Context, key string) (int, error) {
	value := c.Query(key)

	intValue, err := strconv.Atoi(value)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: fmt.Sprintf("incorrect value for %s param", key),
			},
			err,
			http.StatusBadRequest,
		)
		return 0, err
	}

	return intValue, nil
}

func GetIntParamByName(c *gin.Context, key string) (int64, error) {
	value := c.Param(key)

	intValue, err := strconv.ParseInt(value, 0, 64)

	if err != nil {
		JSONResponse(
			c,
			Response{
				Success: false,
				Message: fmt.Sprintf("incorrect value for %s param", key),
			},
			err,
			http.StatusBadRequest,
		)
		return 0, err
	}

	return intValue, nil
}
