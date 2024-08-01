package cmd

import (
	"github.com/loloToster/Cloudia/cli/config"
	"github.com/loloToster/Cloudia/cli/models"

	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"text/tabwriter"

	"github.com/spf13/cobra"
)

const trashedFlagName = "trashed"

// lsCmd represents the ls command
var lsCmd = &cobra.Command{
	Use:   "ls",
	Short: "Lists items",
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Println("Fetching items...")

		trashed, _ := cmd.Flags().GetBool(trashedFlagName)

		queryStr := ""
		if trashed {
			queryStr = "?trashed=true"
		}

		host := config.GetConfig("host")
		res, err := http.Get(host + "/api/items" + queryStr)

		if err != nil {
			return err
		}

		body, err := io.ReadAll(res.Body)

		if err != nil {
			return err
		}

		var parsedBody []models.JsonItem
		err = json.Unmarshal(body, &parsedBody)

		if err != nil {
			return err
		}

		w := tabwriter.NewWriter(os.Stdout, 1, 1, 1, ' ', 0)

		fmt.Fprintln(w, "n.\t| id\t| type\t| title")

		for idx, item := range parsedBody {
			fmt.Fprintf(w, "%v\t| %v\t| %v\t| %v\n", idx+1, item.Id, item.Type, item.Title)
		}

		w.Flush()

		return nil
	},
}

func init() {
	rootCmd.AddCommand(lsCmd)

	lsCmd.Flags().BoolP(trashedFlagName, "t", false, "Whether to list trashed items")
}
