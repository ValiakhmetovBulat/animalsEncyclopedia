package models

import log "animalsEncyclopedia/logger"

type Role struct {
	Id          int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Slug        string `json:"slug" gorm:"size:32;uniqueIndex;not null"`
	Name        string `json:"name" gorm:"size:128;not null"`
	Description string `json:"description" gorm:"size:512"`
}

func GetRoleBySlug(slug string) (*Role, error) {
	var role Role

	err := db.Where(&Role{Slug: slug}).First(&role).Error

	if err != nil {
		return nil, err
	}

	return &role, nil
}

func GetRoleById(id int64) (Role, error) {
	var role Role

	err := db.Where("id = ?", id).First(&role).Error

	if err != nil {
		log.Error(err)
		return role, err
	}

	return role, nil
}

func GetRolesPaginated(page, limit int) ([]Role, int64, error) {
	var rs []Role
	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	offset := (page - 1) * limit
	var total int64

	base := db.Table("roles")

	if err := base.Count(&total).Error; err != nil {
		log.Error(err)
		return nil, 0, err
	}

	err := base.
		Order("name asc, id asc").
		Limit(limit).
		Offset(offset).
		Scan(&rs).Error
	if err != nil {
		log.Error(err)
		return nil, 0, err
	}

	return rs, total, nil
}
