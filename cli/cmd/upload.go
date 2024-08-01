package cmd

import (
	"github.com/loloToster/Cloudia/cli/config"
	"github.com/loloToster/Cloudia/cli/models"

	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/schollz/progressbar/v3"
	"github.com/spf13/cobra"
)

// uploadCmd represents the upload command
var uploadCmd = &cobra.Command{
	Use:   "upload",
	Short: "Uploads a file",
	Args:  cobra.MatchAll(cobra.ExactArgs(1)),
	RunE: func(cmd *cobra.Command, args []string) error {
		path := args[0]

		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)

		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()

		part, err := writer.CreateFormFile("files", path)

		_, err = io.Copy(part, file)
		if err != nil {
			return err
		}

		err = writer.Close()
		if err != nil {
			return err
		}

		reader := progressbar.NewReader(body, progressbar.DefaultBytes(int64(body.Len()), "Uploading"))

		host := config.GetConfig("host")
		res, err := http.Post(host+"/api/file", writer.FormDataContentType(), &reader)

		if err != nil {
			return err
		}

		defer res.Body.Close()
		resBody, err := io.ReadAll(res.Body)

		if err != nil {
			return err
		}

		var parsedResBody []models.JsonItem
		err = json.Unmarshal(resBody, &parsedResBody)

		if err != nil {
			return err
		}

		fmt.Println("Uploaded file with id: " + parsedResBody[0].Id)

		return nil
	},
}

func init() {
	rootCmd.AddCommand(uploadCmd)
}
