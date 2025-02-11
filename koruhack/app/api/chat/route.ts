import { openai } from '@ai-sdk/openai';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const formData = await req.formData();
  const imageFile = formData.get('image') as File;
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

  const {object: students} = await generateObject({
    schema: z.object({
      students: z.array(z.object({
        firstName: z.string(),
        lastName: z.string(),
      })),
    }),
    model: openai('gpt-4o'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: `
            You are a helpful assistant that will take a learning management screenshot and return a JSON object with a list of object each containing the first and lastname of students.
            The image is a screenshot of a class and the students are in the class.

            THE JSON OBJECT SHOULD BE IN THE FOLLOWING FORMAT:
            {
              "students": [
                {
                  "firstName": "John",
                  "lastName": "Doe"
                }
              ]
            }
            ` },
          {
            type: 'image',
            image: imageBuffer,
          },
        ],
      },
    ],
  })

  console.log(JSON.stringify(students, null, 2));
  return new Response(JSON.stringify(students));
} 