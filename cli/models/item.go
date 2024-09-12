package models

type JsonItem struct {
	Type      string `json:"type"`
	Id        string `json:"id"`
	Title     string `json:"title"`
	Text      string `json:"text"`
	Ip        string `json:"ip"`
	CreatedAt int    `json:"created_at"`
	Trashed   int    `json:"trashed"`
}
