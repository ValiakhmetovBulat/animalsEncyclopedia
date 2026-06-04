package models

import (
	log "animalsEncyclopedia/logger"
	"errors"
	"strings"
)

type Fact struct {
	Id       int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Text     string `json:"text" gorm:"text;not null"`
	AnimalId int64  `json:"animal_id" gorm:"index;not null"`
	Animal   Animal `json:"-" gorm:"foreignkey:AnimalId"`
}

func GetFactsByAnimalId(animalId int64) ([]Fact, error) {
	var facts []Fact

	err := db.Where("animal_id = ?", animalId).Find(&facts).Error

	if err != nil {
		log.Error(err)
		return nil, err
	}

	return facts, nil
}

var (
	ErrTextIsEmpty = errors.New("fact's text is empty")
)

func GetFactsPaginated(page, limit int) ([]Fact, int64, error) {
	var fs []Fact
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	offset := (page - 1) * limit
	var total int64

	base := db.Table("facts")

	if err := base.Count(&total).Error; err != nil {
		log.Error(err)
		return nil, 0, err
	}

	err := base.
		Order("text asc, id asc").
		Limit(limit).
		Offset(offset).
		Scan(&fs).Error
	if err != nil {
		log.Error(err)
		return nil, 0, err
	}

	return fs, total, nil
}

func GetFactById(id int64) (*Fact, error) {
	var fact Fact

	err := db.Where("id = ?", id).First(&fact).Error

	if err != nil {
		log.Error(err)
		return nil, err
	}

	return &fact, nil
}

func AddFact(fact *Fact) error {
	if strings.TrimSpace(fact.Text) == "" {
		return ErrTextIsEmpty
	}

	err := db.Where("id = ?", fact.AnimalId).First(&Animal{}).Error

	if err != nil {
		log.Error(err)
		return err
	}

	err = db.Create(fact).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func UpdateFact(fact *Fact) error {
	if strings.TrimSpace(fact.Text) == "" {
		return ErrTextIsEmpty
	}

	err := db.Where("id = ?", fact.AnimalId).First(&Animal{}).Error

	if err != nil {
		log.Error(err)
		return err
	}

	err = db.Save(fact).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func DeleteFact(id int64) error {
	err := db.Where("id = ?", id).Delete(&Fact{}).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}
