import mongoose,{Schema} from "mongooose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    url:{
        type:String,
        required:true,
        trim:true,
    },
    thumnail:{
        type:String,
        required:true,
    },
    videoFile:{
        type:String,
        required:true,
    },
    duration:{
        type:Number, //cloudinary se nikalenge
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    ispublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }



},{timestamps:true});

videoSchema.plugin(mongooseAggregatePaginate) //this is the aggrigation pipline
export const Video = mongoose.model("Video", VideoSchema)