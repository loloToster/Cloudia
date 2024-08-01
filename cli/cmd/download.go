package cmd

import (
	"github.com/loloToster/Cloudia/cli/config"

	"io"
	"net/http"
	"os"

	"github.com/schollz/progressbar/v3"
	"github.com/spf13/cobra"
)

// downloadCmd represents the download command
var downloadCmd = &cobra.Command{
	Use:   "download",
	Short: "Downloads a file",
	Args:  cobra.MatchAll(cobra.ExactArgs(1)),
	RunE: func(cmd *cobra.Command, args []string) error {
		fileId := args[0]

		host := config.GetConfig("host")
		res, err := http.Get(host + "/cdn/" + fileId)

		if err != nil {
			return err
		}

		defer res.Body.Close()
		outFile, err := os.Create(fileId)
		defer outFile.Close()

		if err != nil {
			return err
		}

		bar := progressbar.DefaultBytes(
			res.ContentLength,
			"Downloading: "+fileId,
		)

		_, err = io.Copy(io.MultiWriter(outFile, bar), res.Body)

		if err != nil {
			return err
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(downloadCmd)

	downloadCmd.Flags().String("path", "", "Path to save the file")
}
