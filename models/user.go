package models

import (
	log "animalsEncyclopedia/logger"
	"errors"
	"fmt"
	"net/mail"
	"regexp"
	"time"

	"gorm.io/gorm"
)

type User struct {
	Id              int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	Username        string    `json:"username" gorm:"size:64;uniqueIndex;not null"`
	Email           string    `json:"email" gorm:"size:256;not null;"`
	Hash            string    `json:"hash" gorm:"size:255;not null"`
	Role            Role      `json:"role" gorm:"foreignKey:RoleId"`
	RoleId          int64     `json:"role_id" gorm:"not null"`
	LastLogin       time.Time `json:"last_login"`
	ApiKey          string    `json:"api_key" gorm:"size:255;not null"`
	ApiKeyExpiresAt time.Time `json:"api_key_expires_at"`
}

const (
	MinUsernameLength = 3
	MaxUsernameLength = 64
	MaxNameLength     = 128
)

var usernameRegexp = regexp.MustCompile(`^[a-zA-Z0-9._-]+$`)

type UserValidationError struct {
	Err error
}

func (e UserValidationError) Error() string {
	return e.Err.Error()
}

func (e UserValidationError) Unwrap() error {
	return e.Err
}

var (
	ErrUsernameIsNotUnique   = errors.New("username not unique")
	ErrEmailIsNotUnique      = errors.New("email not unique")
	ErrUsernameInvalidLength = errors.New(
		fmt.Sprintf(
			"username length must be between %d and %d characters",
			MinUsernameLength,
			MaxUsernameLength,
		),
	)
	ErrUsernameInvalidFormat       = errors.New("username has invalid format")
	ErrEmailInvalidFormat          = errors.New("email has invalid format")
	ErrUserIdMismatch              = errors.New("provided user id does not match object id")
	ErrCannotDeleteTheOnlyOneAdmin = errors.New("cannot delete only one admin user")
)

func (u *User) ValidateConflicts(existingUser *User) error {
	var err error = nil

	if u.Username != existingUser.Username {
		_, err = GetUserByUsername(u.Username)

		if err == nil {
			return UserValidationError{ErrUsernameIsNotUnique}
		}

		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if u.Email != existingUser.Email {
		_, err = GetUserByEmail(u.Email)

		if err == nil {
			return UserValidationError{ErrEmailIsNotUnique}
		}

		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	return nil
}

func (u *User) Validate() error {
	if l := len(u.Username); l < MinUsernameLength || l > MaxUsernameLength {
		return UserValidationError{ErrUsernameInvalidLength}
	}
	if !usernameRegexp.MatchString(u.Username) {
		return UserValidationError{ErrUsernameInvalidFormat}
	}
	if _, err := mail.ParseAddress(u.Email); err != nil {
		return UserValidationError{ErrEmailInvalidFormat}
	}
	return nil
}

func GetUserByUsername(username string) (User, error) {
	u := User{}
	err := db.Preload("Role").Where("username = ?", username).First(&u).Error
	return u, err
}

func GetUserByEmail(email string) (User, error) {
	u := User{}
	err := db.Preload("Role").Where("email = ?", email).First(&u).Error
	return u, err
}

func GetUserByApiKey(ak string) (User, error) {
	u := User{}
	err := db.Preload("Role").Where("api_key = ?", ak).First(&u).Error
	return u, err
}

func GetUserById(uid int64) (User, error) {
	var user User

	err := db.Where("id = ?", uid).First(&user).Error

	if err != nil {
		log.Error(err)
		return user, err
	}

	role, err := GetRoleById(user.RoleId)

	if err != nil {
		log.Error(err)
		return user, err
	}

	user.Role = role

	return user, nil
}

func PutUser(uid int64, u *User) error {
	if uid != u.Id {
		return ErrUserIdMismatch
	}

	foundUser, err := GetUserById(uid)

	if err != nil {
		return err
	}

	err = u.Validate()

	if err != nil {
		log.Error(err)
		return err
	}

	err = u.ValidateConflicts(&foundUser)

	if err != nil {
		log.Error(err)
		return err
	}

	if u.Hash == "" {
		u.Hash = foundUser.Hash
	}

	zeroTime := time.Time{}

	if u.ApiKeyExpiresAt == zeroTime {
		u.ApiKeyExpiresAt = foundUser.ApiKeyExpiresAt
	}

	if u.LastLogin == zeroTime {
		u.LastLogin = foundUser.LastLogin
	}

	if u.ApiKey == "" {
		u.ApiKey = foundUser.ApiKey
	}

	err = db.Save(u).Error

	if err != nil {
		log.Error(err)
		return err
	}

	return err
}
