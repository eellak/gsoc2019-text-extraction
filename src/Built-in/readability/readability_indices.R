# Load necessary packages
.libPaths("Rlibrary")
libPath <- "Rlibrary"
library("koRpus")
library("koRpus.lang.en")
library("quanteda")
library("readtext")
library("jsonlite")

# Set koRpus environment (language)
set.kRp.env(lang="en")

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

resultFilePath <- "results.json"
index <- temp;
write("[", file=resultFilePath)
for (i in 1:length(filePaths)) {
    # book <- readtext(filePaths[i])
    tagged_text <- treetag(filePaths[i], treetagger="manual", lang=get.kRp.env(lang=T), TT.options=list(path="C:\\TreeTagger", preset="en"), doc_id="sample")
    hyphened_text <- hyphen(tagged_text, quiet=T)
    # tokens <- tokens(book$text, remove_punct=T, what="word")
    
    # dale_chall_wordlist is a list of 3000 common english words, needed for some readability indices
    dale_chall_wordlist <- readtext("src\\Built-in\\readability\\daleChallWordList.txt")
    dale_chall_wordlist <- tokens(dale_chall_wordlist$text, what="word")
    read_indices <- readability(tagged_text, index=index, hyphen=hyphened_text, word.lists=list(Bormuth=dale_chall_wordlist$text1, Dale.Chall=dale_chall_wordlist$text1, Harris.Jacobson=dale_chall_wordlist$text1, Spache=dale_chall_wordlist$text1))
    
    indices <- list()
    result <- c()
    for(id in index) {
        # Delete unwanted fields of data frames
        slot(read_indices, id)[c("word.list", "not.on.list", "FOG.hard.words", "dropped")] <- NULL
        slot(read_indices, id)["id"] <- id
        # indices <- append(indices, slot(read_indices, id))
        result <- c(result, toJSON(slot(read_indices, id), auto_unbox=T))
    }
}
write(result, file=resultFilePath, append=T, sep=',', ncolumns=length(result))
write("]", file=resultFilePath, append=T)