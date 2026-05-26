package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetIntQueryByName(c *gin.Context, key string) (int, error) {
	value := c.Query(key)

	intValue, err := strconv.Atoi(value)

	if err != nil {
		return 0, err
	}

	return intValue, nil
}
