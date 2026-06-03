package models

import (
	log "animalsEncyclopedia/logger"
	"errors"
	"fmt"
	"strings"
)

var (
	ErrBreedNameIsEmpty = errors.New("breed name is empty")
)

type Breed struct {
	Id     int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name   string `json:"name" gorm:"size:128;not null"`
	TypeId int64  `json:"type_id" gorm:"index;not null"`
	Type   Type   `json:"-" gorm:"foreignkey:TypeId"`
}

type BreedOption struct {
	Id   int64  `json:"id" gorm:"id"`
	Name string `json:"name" gorm:"name"`
}

func GetBreedById(id int64) (*Breed, error) {
	var breed Breed
	err := db.Where("id = ?", id).First(&breed).Error
	if err != nil {
		log.Error(err)
		return nil, err
	}
	return &breed, nil
}

func GetBreeds() ([]*Breed, error) {
	var breed []*Breed

	err := db.Find(&breed).Error

	if err != nil {
		log.Error(err)
		return nil, err
	}

	return breed, nil
}

func GetBreedsByTypeId(typeId int) ([]*Breed, error) {
	var breeds []*Breed

	var err error

	if typeId > 0 {
		err = db.Where("type_id = ?", typeId).Find(&breeds).Error
	} else {
		breeds, err = GetBreeds()
	}

	if err != nil {
		log.Error(err)
		return nil, err
	}

	return breeds, nil
}

type BreedValidationError struct {
	Err error
}

func (b *Breed) Validate() error {
	_, err := GetTypeById(b.TypeId)

	if err != nil {
		return BreedValidationError{err}
	}

	if len(b.Name) <= 0 || len(b.Name) > 128 {
		return BreedValidationError{fmt.Errorf("name length must be between 0 and 128")}
	}

	return nil
}

func (e BreedValidationError) Error() string {
	return e.Err.Error()
}

func (e BreedValidationError) Unwrap() error {
	return e.Err
}

func PostBreed(b *Breed) error {
	err := b.Validate()

	if err != nil {
		return err
	}

	err = db.Save(b).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func GetBreedsPaginated(page, limit int) ([]Breed, int64, error) {
	var bs []Breed
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	offset := (page - 1) * limit
	var total int64

	base := db.Table("breeds")

	if err := base.Count(&total).Error; err != nil {
		log.Error(err)
		return nil, 0, err
	}

	err := base.
		Order("name asc, id asc").
		Limit(limit).
		Offset(offset).
		Scan(&bs).Error
	if err != nil {
		log.Error(err)
		return nil, 0, err
	}

	return bs, total, nil
}

func UpdateBreed(breed *Breed) error {
	if strings.TrimSpace(breed.Name) == "" {
		return BreedValidationError{ErrBreedNameIsEmpty}
	}

	err := db.Where("id = ?", breed.TypeId).First(&Type{}).Error

	if err != nil {
		log.Error(err)
		return err
	}

	err = db.Save(breed).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func DeleteBreed(id int64) error {
	err := db.Where("id = ?", id).Delete(&Breed{}).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func GetBreedOptions() ([]BreedOption, error) {
	var breedOptions []BreedOption

	err := db.Table("breeds").Select("id, name").Find(&breedOptions).Error

	if err != nil {
		log.Error(err)
		return breedOptions, err
	}

	return breedOptions, nil
}

func GetBreedOptionsWithTypeId(typeId int) ([]BreedOption, error) {
	var breedOptions []BreedOption

	err := db.Table("breeds").Select("id, name").Where("type_id = ?", typeId).Find(&breedOptions).Error

	if err != nil {
		log.Error(err)
		return breedOptions, err
	}

	return breedOptions, nil
}
