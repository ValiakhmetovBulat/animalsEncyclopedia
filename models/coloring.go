package models

import (
	log "animalsEncyclopedia/logger"
	"errors"
	"strings"
)

var (
	ErrColoringNameIsEmpty = errors.New("coloring's breed name is empty")
)

type Coloring struct {
	Id        int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name      string `json:"name" gorm:"size:128;not null"`
	ImageLink string `json:"image_link" gorm:"text"`
	BreedId   int64  `json:"breed_id" gorm:"index;not null"`
	Breed     Breed  `json:"-" gorm:"foreignkey:BreedId"`
}

func GetColoringsPaginated(page, limit int) ([]Coloring, int64, error) {
	var cs []Coloring
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	offset := (page - 1) * limit
	var total int64

	base := db.Table("colorings")

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

func GetColoringsByBreedId(breedId int64) ([]Coloring, error) {
	var cs []Coloring

	err := db.Where("breed_id = ?", breedId).Find(&cs).Error

	if err != nil {
		log.Error(err)
		return nil, err
	}

	return cs, nil
}

func GetColoringById(id int64) (*Coloring, error) {
	var coloring Coloring

	err := db.Where("id = ?", id).First(&coloring).Error

	if err != nil {
		log.Error(err)
		return nil, err
	}

	return &coloring, nil
}

func AddColoring(coloring *Coloring) error {
	if strings.TrimSpace(coloring.Name) == "" {
		return ErrColoringNameIsEmpty
	}

	err := db.Where("id = ?", coloring.BreedId).First(&Breed{}).Error

	if err != nil {
		log.Error(err)
		return err
	}

	err = db.Create(coloring).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func UpdateColoring(coloring *Coloring) error {
	if strings.TrimSpace(coloring.Name) == "" {
		return ErrTextIsEmpty
	}

	err := db.Where("id = ?", coloring.BreedId).First(&Breed{}).Error

	if err != nil {
		log.Error(err)
		return err
	}

	err = db.Save(coloring).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func DeleteColoring(id int64) error {
	err := db.Where("id = ?", id).Delete(&Coloring{}).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}
