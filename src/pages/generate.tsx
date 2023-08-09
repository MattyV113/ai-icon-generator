import { type NextPage } from "next";

import { api } from "../utils/api";
import { Input } from "./components/Input/Input";
import { FormGroup } from "./components/FormGroup";
import { useState } from "react";

const GeneratePage: NextPage = () => {
  const [form, setForm] = useState({
    prompt: "",
  });

  const generateIcon = api.generate.generateIcon.useMutation({
    onSuccess(data) {
      console.log("mutation complete", data);
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateIcon.mutate({
      prompt: form.prompt,
    });
  };

  const handleChange = (key: string) => {
    return function (e: React.ChangeEvent<HTMLInputElement>) {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };
  };

  return (
    <>
      <main className="flex min-h-screen flex-col justify-center text-center ">
        <form
          onSubmit={handleFormSubmit}
          className="m-auto flex flex-col gap-4"
        >
          <FormGroup>
            <label>Prompt</label>
            <Input value={form.prompt} onChange={handleChange("prompt")} />
          </FormGroup>
          <button className="rounded bg-blue-400 px-4 py-2 hover:bg-blue-500">
            Submit
          </button>
        </form>
      </main>
    </>
  );
};

export default GeneratePage;
