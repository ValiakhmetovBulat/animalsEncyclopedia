package models

import (
	log "animalsEncyclopedia/logger"
	"fmt"
)

type Animal struct {
	Id          int64    `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string   `json:"name" gorm:"size:256;not null"`
	Description string   `json:"description" gorm:"text"`
	TypeId      int64    `json:"type_id" gorm:"index;not null"`
	Type        *Type    `json:"type" gorm:"foreignkey:TypeId"`
	CountryId   int64    `json:"country_id" gorm:"index;not null"`
	Country     *Country `json:"country" gorm:"foreignkey:CountryId"`
	BreedId     int64    `json:"breed_id" gorm:"index;not null"`
	Breed       *Breed   `json:"breed" gorm:"foreignkey:BreedId"`
	ImageLink   string   `json:"image_link" gorm:"text"`
}

type AnimalOption struct {
	Id   int64  `json:"id" gorm:"id"`
	Name string `json:"name" gorm:"name"`
}

func (a *Animal) getDetails() {
	t, err := GetTypeById(a.TypeId)

	if err != nil {
		log.Warn(fmt.Errorf("cannot get animal's type: %w", err))
	}

	a.Type = t

	c, err := GetCountryById(a.CountryId)

	if err != nil {
		log.Warn(fmt.Errorf("cannot get animal's country: %w", err))
	}

	a.Country = c

	b, err := GetBreedById(a.BreedId)

	if err != nil {
		log.Warn(fmt.Errorf("cannot get animal's breed: %w", err))
	}

	a.Breed = b
}

type AnimalValidationError struct {
	Err error
}

func (a *Animal) Validate() error {
	_, err := GetTypeById(a.TypeId)

	if err != nil {
		return AnimalValidationError{err}
	}

	_, err = GetBreedById(a.BreedId)
	if err != nil {
		return AnimalValidationError{err}
	}

	_, err = GetCountryById(a.CountryId)
	if err != nil {
		return AnimalValidationError{err}
	}

	if len(a.Name) <= 0 || len(a.Name) > 256 {
		return AnimalValidationError{fmt.Errorf("name length must be between 0 and 256")}
	}

	return nil
}

func (e AnimalValidationError) Error() string {
	return e.Err.Error()
}

func (e AnimalValidationError) Unwrap() error {
	return e.Err
}

func PostAnimal(a *Animal) error {
	err := a.Validate()

	if err != nil {
		return err
	}

	err = db.Create(a).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func DeleteAnimal(id int64) error {
	err := db.Where("id = ?", id).Delete(&Animal{}).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func GetAnimalById(id int64) (*Animal, error) {
	var animal Animal

	err := db.Where("id = ?", id).First(&animal).Error

	if err != nil {
		log.Error(err)
		return nil, err
	}

	return &animal, nil
}

func UpdateAnimal(a *Animal) error {
	err := a.Validate()

	if err != nil {
		return err
	}

	err = db.Save(a).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func GetAnimalsPaginated(page, limit, typeId, breedId, countryId int, term string) ([]Animal, int64, error) {
	var animals []Animal

	animals = []Animal{}

	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	offset := (page - 1) * limit
	var total int64

	base := db.Table("animals")

	if err := base.Count(&total).Error; err != nil {
		log.Error(err)
		return animals, 0, err
	}

	whereBase := base

	if typeId > 0 {
		whereBase = base.Where("type_id = ?", typeId)
	}

	if breedId > 0 {
		whereBase = base.Where("breed_id = ?", breedId)
	}

	if countryId > 0 {
		whereBase = base.Where("country_id = ?", countryId)
	}

	if term != "" {
		whereBase = base.Where("name LIKE ? or description LIKE ?", "%"+term+"%", "%"+term+"%")
	}

	err := whereBase.
		Select("*").
		Limit(limit).
		Offset(offset).
		Order("name asc, id asc").
		Scan(&animals).Error
	if err != nil {
		log.Error(err)
		return animals, 0, err
	}

	for i := range animals {
		animals[i].getDetails()
	}

	return animals, total, nil
}

func GetAnimalOptions() ([]AnimalOption, error) {
	var animalOptions []AnimalOption

	err := db.Table("animals").Select("id, name").Find(&animalOptions).Error

	if err != nil {
		log.Error(err)
		return animalOptions, err
	}

	return animalOptions, nil
}
