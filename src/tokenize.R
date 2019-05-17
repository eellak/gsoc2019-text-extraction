r <- getOption("repos")
r["CRAN"] <- "http://cran.us.r-project.org"
options(repos = r)
rm(r)

if(!dir.exists("Rlibrary")) dir.create("Rlibrary");

.libPaths("Rlibrary")
libPath <- "Rlibrary"
if (!require(koRpus)) { install.packages('koRpus', lib=libPath) }
library(koRpus)
if(!require(koRpus.lang.en)) { install.koRpus.lang("en", lib=libPath) }
library(koRpus.lang.en)
#if(!require(here)) { install.packages('here')}
#library(here)

filePaths <- commandArgs(trailingOnly=T)

set.kRp.env(lang="en")

tokens <- matrix(0, nrow=length(filePaths), ncol=10)
for (i in 1:length(filePaths)) {
  tokens[i,] <- tokenize(txt=filePaths[i], format="file", lang=get.kRp.env(lang=T), tag=F)[1:10]
}

print(tokens)