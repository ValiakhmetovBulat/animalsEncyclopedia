package util

import (
	"animalsEncyclopedia/auth"
	log "animalsEncyclopedia/logger"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"
	"math/big"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// CheckAndCreateSSL is a helper to setup self-signed certificates for the administrative interface.
func CheckAndCreateSSL(cp string, kp string) error {
	// Check whether there is an existing SSL certificate and/or key, and if so, abort execution of this function
	if _, err := os.Stat(cp); !os.IsNotExist(err) {
		return nil
	}
	if _, err := os.Stat(kp); !os.IsNotExist(err) {
		return nil
	}

	log.Infof("Creating new self-signed certificates for administration interface")

	priv, err := ecdsa.GenerateKey(elliptic.P384(), rand.Reader)
	if err != nil {
		return fmt.Errorf("error generating tls private key: %v", err)
	}

	notBefore := time.Now()
	// Generate a certificate that lasts for 10 years
	notAfter := notBefore.Add(10 * 365 * 24 * time.Hour)

	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)

	if err != nil {
		return fmt.Errorf("tls certificate generation: failed to generate a random serial number: %s", err)
	}

	template := x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			Organization: []string{"PhishNet"},
		},
		NotBefore: notBefore,
		NotAfter:  notAfter,

		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}

	derBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, priv.Public(), priv)
	if err != nil {
		return fmt.Errorf("tls certificate generation: failed to create certificate: %s", err)
	}

	certOut, err := os.Create(cp)
	if err != nil {
		return fmt.Errorf("tls certificate generation: failed to open %s for writing: %s", cp, err)
	}
	pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: derBytes})
	certOut.Close()

	keyOut, err := os.OpenFile(kp, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		return fmt.Errorf("tls certificate generation: failed to open %s for writing", kp)
	}

	b, err := x509.MarshalECPrivateKey(priv)
	if err != nil {
		return fmt.Errorf("tls certificate generation: unable to marshal ECDSA private key: %v", err)
	}

	pem.Encode(keyOut, &pem.Block{Type: "EC PRIVATE KEY", Bytes: b})
	keyOut.Close()

	log.Info("TLS Certificate Generation complete")
	return nil
}

func SaveBase64Image(base64Image string, saveDir string) (string, error) {
	if base64Image == "" {
		return "", nil
	}

	split := strings.Split(base64Image, ",")

	if len(split) != 2 {
		return "", errors.New("invalid base64 image")
	}

	meta := split[0]
	data := split[1]

	var ext string

	switch {
	case strings.Contains(meta, "image/png"):
		ext = ".png"
	case strings.Contains(meta, "image/jpeg"):
		ext = ".jpg"
	case strings.Contains(meta, "image/webp"):
		ext = ".webp"
	case strings.Contains(meta, "image/jpg"):
		ext = ".jpg"
	default:
		return "", errors.New("unsupported image format")
	}

	imageBytes, err := base64.StdEncoding.DecodeString(data)

	if err != nil {
		return "", err
	}

	safeFileName := auth.GenerateSecureKey(8)
	fileName := safeFileName + ext

	fullPath := filepath.Join(saveDir, fileName)

	err = os.WriteFile(fullPath, imageBytes, 0644)

	if err != nil {
		return "", err
	}

	return fileName, nil
}

func DeleteImage(dir, filename string) error {
	filePath := filepath.Join(dir, filename)

	err := os.Remove(filePath)

	if err != nil {
		log.Errorf("error deleting file %s: %s", filePath, err)
	}

	return nil
}
