# Load necessary packages
.libPaths("Rlibrary")
libPath <- "Rlibrary"
library("quanteda")
library("readtext")
library("jsonlite")

# Get and split commandArgs (paths of the files to process and readability indices)
args <- commandArgs(trailingOnly=T)
filePaths <- c();
index <- c();
temp <- c();
for(arg in args) {
    if(arg == "-filePaths") {
        next;
    }
    else if (arg == "-index") {
       filePaths <- temp;
        temp <- c();
        next;
    }
    temp <- c(temp, arg);
}
index <- temp;

fileNames <- basename(filePaths)
resultFilePath <- "results.json"

books <- c()
for (i in 1:length(filePaths)) {
    books <- c(books, readtext(filePaths[i])$text)
}
    texts <- corpus(books, docnames=fileNames)    
    read_indices <- textstat_readability(texts, measure=index)
    
    toks <- tokens(texts, remove_punct=T)
    tokensNum <- c()
    for(name in fileNames) {
    tokensNum <- c(tokensNum, length(toks[[name]]))
    }

    features <- dfm(toks, stem=T, tolower=T)

    vocabularyNum <- c()
    for(i in 1:length(filePaths)) {
    vocabularyNum <- c(vocabularyNum, length(textstat_frequency(features[i])$feature))
    }
    read_indices["TokensNum"] <- tokensNum
    read_indices["Vocabulary"] <- vocabularyNum
print(toJSON(read_indices))
write(toJSON(read_indices), file=resultFilePath, sep=',')
