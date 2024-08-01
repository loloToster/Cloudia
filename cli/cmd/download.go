package cmd

import (
	"github.com/loloToster/Cloudia/cli/config"

	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/spf13/cobra"
)

// downloadCmd represents the download command
var downloadCmd = &cobra.Command{
	Use:   "download",
	Short: "Downloads a file",
	Args:  cobra.MatchAll(cobra.ExactArgs(1)),
	RunE: func(cmd *cobra.Command, args []string) error {
		fileId := args[0]

		fmt.Println("Downloading: " + fileId + "...")

		host := config.GetConfig("host")
		res, err := http.Get(host + "/cdn/" + fileId)

		if err != nil {
			return err
		}

		fmt.Println(res.Body)

		outFile, err := os.Create(fileId)

		if err != nil {
			return err
		}

		defer outFile.Close()
		_, err = io.Copy(outFile, res.Body)

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
