import {db} from "../name";
import createQuestionCollection from "./question.collection";
import createAnswerCollection from "./answer.collection";
import createVoteCollection from "./vote.collection";
import createCommentCollection from "./comment.collection";


import { databases } from "./config";

export default async function getOrCreateDB(){
    try {
        await databases.get(db)
        console.log("Database connection")
    } catch (error) {
        try {
            await databases.create(db,db)
            console.log("database created");
            // create collection
            await Promise.all([
                createQuestionCollection(),
                createAnswerCollection(),
                createCommentCollection(),
                createVoteCollection()
                
            ])
            console.log("Collection created");
            console.log("Database connected")
        } catch (error) {
            console.log("Error creating databases or collection",error)
        }
    }

    return databases
}

