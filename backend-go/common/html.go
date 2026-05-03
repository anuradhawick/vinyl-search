package common

import (
	"bytes"
	"strings"

	"golang.org/x/net/html"
)

type HTMLRewriteResult struct {
	HTML      string
	NewImages []string
	AllImages []string
	Text      string
}

func RewriteForumHTML(input string) (HTMLRewriteResult, error) {
	root, err := html.Parse(strings.NewReader(input))
	if err != nil {
		return HTMLRewriteResult{}, err
	}

	var result HTMLRewriteResult
	var visit func(*html.Node)
	visit = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "img" {
			for i := range n.Attr {
				if n.Attr[i].Key != "src" {
					continue
				}
				src := n.Attr[i].Val
				filename := Filename(src)
				if PreviousPathSegment(src) == "temp" {
					result.NewImages = append(result.NewImages, src)
					src = "https://" + LoadConfig().CDNDomain + "/forum-images/" + filename
					n.Attr[i].Val = src
				}
				result.AllImages = append(result.AllImages, src)
			}
		}
		if n.Type == html.TextNode {
			text := strings.TrimSpace(n.Data)
			if text != "" {
				if result.Text != "" {
					result.Text += "\n"
				}
				result.Text += text
			}
		}
		for child := n.FirstChild; child != nil; child = child.NextSibling {
			visit(child)
		}
	}
	visit(root)

	var buf bytes.Buffer
	for child := root.FirstChild; child != nil; child = child.NextSibling {
		if err := html.Render(&buf, child); err != nil {
			return HTMLRewriteResult{}, err
		}
	}
	result.HTML = buf.String()
	return result, nil
}

func ImageSources(input string) ([]string, error) {
	root, err := html.Parse(strings.NewReader(input))
	if err != nil {
		return nil, err
	}
	var images []string
	var visit func(*html.Node)
	visit = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "img" {
			for _, attr := range n.Attr {
				if attr.Key == "src" {
					images = append(images, attr.Val)
				}
			}
		}
		for child := n.FirstChild; child != nil; child = child.NextSibling {
			visit(child)
		}
	}
	visit(root)
	return images, nil
}
