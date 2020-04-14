import mongoose from 'mongoose';
import Dog from '../models/dog';


export const resolvers = {
  Query: {
    getOneDog: async (root, {id}) => {

      try {

        const foundDog = await Dog.findById(id);

        return foundDog;

      } catch(err) {
        console.log(err, ' this is')
        return err
      }

    },
    getDogs: async () => {
      try {
        const dogs = await Dog.find();

        return dogs;

      } catch(err){
        return err
      }
    }
  },
  Mutation: {
    createDog: async (parent, args) => {
      console.log(args)
      try {
        const newDog = await Dog.create(args.input);
        console.log(newDog, ' this is new dog')
        return newDog

      } catch(err) {
        return err
      }
    },
    updateDog: async (root, {input}) => {
      try {
        const updateDog = await  Dog.findOneAndReplace(input._id, input,{new: true});

        return updateDog
      } catch(err) {
        return err
      }
    },
    deleteDog: async (id) => {
      try {
        await Dog.findOneAndDelete(id)

        return 'Dog has been deleted'
      } catch(err){
        return err
      }
    }
  }
}
