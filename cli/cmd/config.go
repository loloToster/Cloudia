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
	Args:  cobra.MatchAll(cobra.ExactArgs(2)),
	Run: func(cmd *cobra.Command, args []string) {
		key, val := args[0], args[1]
		config.SetConfig(key, val)
		fmt.Println("Setting '" + key + "' to '" + val + "'")
	},
}

func init() {
	rootCmd.AddCommand(configCmd)
}
