import { type NextPage } from "next";

import { api } from "../utils/api";
import { Input } from "./components/Input";
import { FormGroup } from "./components/FormGroup";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./components/Button";

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

  const isLoggedIn = useSession().data;

  return (
    <>
      <main className="flex min-h-screen flex-col justify-center text-center ">
        <form
          onSubmit={handleFormSubmit}
          className="m-auto flex flex-col gap-4"
        >
          <FormGroup>
            {!isLoggedIn && (
              <Button
                onClick={() => {
                  signIn().catch((err) => console.log(err));
                }}
              >
                Login
              </Button>
            )}
            {isLoggedIn && (
              <Button
                onClick={() => {
                  signOut().catch((err) => console.log(err));
                }}
              >
                Logout
              </Button>
            )}
            <label>Prompt</label>
            <Input value={form.prompt} onChange={handleChange("prompt")} />
          </FormGroup>
          <Button>Submit</Button>
        </form>
      </main>
    </>
  );
};

export default GeneratePage;
