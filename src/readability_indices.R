# Main program
.libPaths("Rlibrary")
libPath <- "Rlibrary"
library("koRpus")
library("koRpus.lang.en")
library("quanteda")
library("readtext")
library("jsonlite")
library("R.utils")
set.kRp.env(lang="en", TT.cmd="C:\\TreeTagger\\bin\\tree-tagger.exe")
args <- commandArgs(trailingOnly=T, asValues=T)

filePaths <- unlist(strsplit(args$filePaths, split=','))
index <- unlist(strsplit(args$index, split=','))
for (i in 1:length(filePaths)) {
    book <- readtext(filePaths[i])
    tagged_text <- treetag(filePaths[i], treetagger="manual", lang=get.kRp.env(lang=T), TT.options=list(path="C:\\TreeTagger", preset="en"), doc_id="sample")
    hyphened_text <- hyphen(tagged_text, quiet=T)
    # tokens <- tokens(book$text, remove_punct=T, what="word")
    dale_chall_wordlist <- readtext("src\\daleChallWordList.txt")
    dale_chall_wordlist <- tokens(dale_chall_wordlist$text, what="word")
    read_indices <- readability(tagged_text, index=index, hyphen=hyphened_text, word.lists=list(Bormuth=dale_chall_wordlist$text1, Dale.Chall=dale_chall_wordlist$text1, Harris.Jacobson=dale_chall_wordlist$text1, Spache=dale_chall_wordlist$text1))
    
    indices <- list()
    for(id in index) {
        slot(read_indices, id)[c("word.list", "not.on.list", "FOG.hard.words", "dropped")] <- NULL
        slot(read_indices, id)["id"] <- id
        # indices <- append(indices, slot(read_indices, id))
        print(toJSON(slot(read_indices, id), auto_unbox=T))
    }
}