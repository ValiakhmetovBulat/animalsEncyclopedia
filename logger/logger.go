package logger

import (
	"io"
	"os"

	"github.com/sirupsen/logrus"
)

var Logger *logrus.Logger

func init() {
	Logger = logrus.New()
	Logger.Formatter = &logrus.TextFormatter{DisableColors: false, ForceColors: true}
}

type Config struct {
	Filename string `json:"filename"`
	Level    string `json:"level"`
}

func Setup(config *Config) error {
	var err error

	level := logrus.InfoLevel
	if config.Level != "" {
		level, err = logrus.ParseLevel(config.Level)
		if err != nil {
			return err
		}
	}

	Logger.SetLevel(level)
	logFile := config.Filename
	if logFile != "" {
		f, err := os.OpenFile(logFile, os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0644)

		if err != nil {
			return err
		}

		Logger.Out = os.Stderr
		Logger.AddHook(&fileHook{
			Writer:    f,
			Formatter: &logrus.TextFormatter{DisableColors: true},
			levels:    logrus.AllLevels,
		})
	}
	return nil
}

// Debug logs a debug message
func Debug(args ...interface{}) {
	Logger.Debug(args...)
}

// Debugf logs a formatted debug message
func Debugf(format string, args ...interface{}) {
	Logger.Debugf(format, args...)
}

// Info logs an informational message
func Info(args ...interface{}) {
	Logger.Info(args...)
}

// Infof logs a formatted informational message
func Infof(format string, args ...interface{}) {
	Logger.Infof(format, args...)
}

// Error logs an error message
func Error(args ...interface{}) {
	Logger.Error(args...)
}

// Errorf logs a formatted error message
func Errorf(format string, args ...interface{}) {
	Logger.Errorf(format, args...)
}

// Warn logs a warning message
func Warn(args ...interface{}) {
	Logger.Warn(args...)
}

// Warnf logs a formatted warning message
func Warnf(format string, args ...interface{}) {
	Logger.Warnf(format, args...)
}

// Fatal logs a fatal error message
func Fatal(args ...interface{}) {
	Logger.Fatal(args...)
}

// Fatalf logs a formatted fatal error message
func Fatalf(format string, args ...interface{}) {
	Logger.Fatalf(format, args...)
}

// WithFields returns a new log enty with the provided fields
func WithFields(fields logrus.Fields) *logrus.Entry {
	return Logger.WithFields(fields)
}

// Writer returns the current logging writer
func Writer() *io.PipeWriter {
	return Logger.Writer()
}

type fileHook struct {
	Writer    io.Writer
	Formatter logrus.Formatter
	levels    []logrus.Level
}

func (h *fileHook) Levels() []logrus.Level {
	return h.levels
}

func (h *fileHook) Fire(entry *logrus.Entry) error {
	line, err := h.Formatter.Format(entry)
	if err != nil {
		return err
	}
	_, err = h.Writer.Write(line)
	return err
}
