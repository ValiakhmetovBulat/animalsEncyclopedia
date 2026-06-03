package models

import (
	log "animalsEncyclopedia/logger"
	"errors"
	"fmt"
	"strings"
)

var (
	ErrTypeNameIsEmpty = errors.New("type's name is empty")
)

type Type struct {
	Id   int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name string `json:"name" gorm:"size:128;not null"`
}

type TypeOption struct {
	Id   int64  `json:"id" gorm:"id"`
	Name string `json:"name" gorm:"name"`
}

func GetTypeById(id int64) (*Type, error) {
	var t Type
	err := db.Where("id = ?", id).First(&t).Error
	if err != nil {
		log.Error(err)
		return nil, err
	}
	return &t, nil
}

func GetTypes() ([]*Type, error) {
	var t []*Type

	err := db.Find(&t).Error

	if err != nil {
		log.Error(err)
		return nil, err
	}

	return t, nil
}

type TypeValidationError struct {
	Err error
}

func (t *Type) Validate() error {
	if len(t.Name) <= 0 || len(t.Name) > 128 {
		return BreedValidationError{fmt.Errorf("name length must be between 0 and 128")}
	}

	return nil
}

func (e TypeValidationError) Error() string {
	return e.Err.Error()
}

func (e TypeValidationError) Unwrap() error {
	return e.Err
}

func GetTypesPaginated(page, limit int) ([]Type, int64, error) {
	var ts []Type
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	offset := (page - 1) * limit
	var total int64

	base := db.Table("types")

	if err := base.Count(&total).Error; err != nil {
		log.Error(err)
		return nil, 0, err
	}

	err := base.
		Order("name asc, id asc").
		Limit(limit).
		Offset(offset).
		Scan(&ts).Error
	if err != nil {
		log.Error(err)
		return nil, 0, err
	}

	return ts, total, nil
}

func PostType(t *Type) error {
	err := t.Validate()

	if err != nil {
		return err
	}

	err = db.Save(t).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func UpdateType(t *Type) error {
	if strings.TrimSpace(t.Name) == "" {
		return ErrTypeNameIsEmpty
	}

	err := db.Save(t).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func DeleteType(id int64) error {
	err := db.Where("id = ?", id).Delete(&Type{}).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func GetTypeOptions() ([]TypeOption, error) {
	var typeOptions []TypeOption

	err := db.Table("types").Select("id, name").Find(&typeOptions).Error

	if err != nil {
		log.Error(err)
		return typeOptions, err
	}

	return typeOptions, nil
}
