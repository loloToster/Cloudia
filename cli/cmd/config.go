package cmd

import (
	"github.com/loloToster/Cloudia/cli/config"

	"fmt"

	"github.com/spf13/cobra"
)

// configCmd represents the config command
var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Sets config value",
	Args:  cobra.RangeArgs(0, 2),
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 2 {
			key, val := args[0], args[1]
			config.SetConfig(key, val)
			fmt.Println("Setting '" + key + "' to '" + val + "'")
		} else {
			fmt.Print(config.GetAllConfig())
		}
	},
}

func init() {
	rootCmd.AddCommand(configCmd)
}
