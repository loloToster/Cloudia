package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

const configFileName = ".cloudia.json"

func getConfigPath() string {
	dir, _ := os.UserHomeDir()
	return filepath.Join(dir, configFileName)
}

func createFileIfNotExisting() string {
	configPath := getConfigPath()

	if _, err := os.Stat(configPath); errors.Is(err, os.ErrNotExist) {
		os.WriteFile(configPath, []byte("{}"), 0755)
	}

	return configPath
}

func SetConfig(key string, val string) {
	configPath := createFileIfNotExisting()

	jsonFile, _ := os.Open(configPath)
	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)

	var result map[string]interface{}
	json.Unmarshal([]byte(byteValue), &result)

	result[key] = val

	jsoned, _ := json.MarshalIndent(result, "", "  ")

	os.WriteFile(configPath, jsoned, 0644)
}

func GetConfig(key string) string {
	configPath := createFileIfNotExisting()

	jsonFile, _ := os.Open(configPath)
	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)

	var result map[string]interface{}
	json.Unmarshal([]byte(byteValue), &result)

	value := result[key]

	if value == nil {
		value = ""
	}

	return value.(string)
}

func GetAllConfig() string {
	configPath := createFileIfNotExisting()

	jsonFile, _ := os.Open(configPath)
	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)

	var result map[string]interface{}
	json.Unmarshal([]byte(byteValue), &result)

	conf := ""

	for k, v := range result {
		conf += fmt.Sprintf("%s=%s\n", k, v)
	}

	return conf
}
