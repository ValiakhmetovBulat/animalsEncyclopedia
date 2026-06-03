package models

import log "animalsEncyclopedia/logger"

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
