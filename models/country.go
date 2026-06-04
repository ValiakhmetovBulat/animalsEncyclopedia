package models

import (
	log "animalsEncyclopedia/logger"
	"errors"
	"fmt"
	"strings"
)

type Country struct {
	Id   int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name string `json:"name" gorm:"size:128;not null"`
}

type CountryOption struct {
	Id   int64  `json:"id" gorm:"id"`
	Name string `json:"name" gorm:"name"`
}

var (
	ErrCountryNameIsEmpty = errors.New("country's name is empty")
)

func GetCountryById(id int64) (*Country, error) {
	var country Country
	err := db.Where("id = ?", id).First(&country).Error
	if err != nil {
		log.Error(err)
		return nil, err
	}
	return &country, nil
}

func GetCountries() (*[]Country, error) {
	var countries []Country

	err := db.Find(&countries).Error

	if err != nil {
		log.Error(err)
		return nil, err
	}

	return &countries, nil
}

type CountryValidationError struct {
	Err error
}

func (c *Country) Validate() error {
	if len(c.Name) <= 0 || len(c.Name) > 128 {
		return BreedValidationError{fmt.Errorf("name length must be between 0 and 128")}
	}

	return nil
}

func (e CountryValidationError) Error() string {
	return e.Err.Error()
}

func (e CountryValidationError) Unwrap() error {
	return e.Err
}

func GetCountriesPaginated(page, limit int) ([]Country, int64, error) {
	var cs []Country
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	offset := (page - 1) * limit
	var total int64

	base := db.Table("countries")

	if err := base.Count(&total).Error; err != nil {
		log.Error(err)
		return nil, 0, err
	}

	err := base.
		Order("name asc, id asc").
		Limit(limit).
		Offset(offset).
		Scan(&cs).Error
	if err != nil {
		log.Error(err)
		return nil, 0, err
	}

	return cs, total, nil
}

func AddCountry(c *Country) error {
	err := c.Validate()

	if err != nil {
		return err
	}

	err = db.Create(c).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func UpdateCountry(country *Country) error {
	if strings.TrimSpace(country.Name) == "" {
		return ErrCountryNameIsEmpty
	}

	err := db.Save(country).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func DeleteCountry(id int64) error {
	err := db.Where("id = ?", id).Delete(&Country{}).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func GetCountryOptions() ([]CountryOption, error) {
	var countryOptions []CountryOption

	err := db.Table("countries").Select("id, name").Find(&countryOptions).Error

	if err != nil {
		log.Error(err)
		return countryOptions, err
	}

	return countryOptions, nil
}
