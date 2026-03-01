terraform {
  backend "s3" {
    bucket         = "terraform-states-anuradhawick"
    key            = "vinyl.lk"
    region         = "ap-southeast-1"
  }
}