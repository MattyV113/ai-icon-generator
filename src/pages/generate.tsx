/* eslint-disable @next/next/no-img-element */
import { type NextPage } from "next";

import { api } from "../utils/api";
import { Input } from "./components/Input";
import { FormGroup } from "./components/FormGroup";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./components/Button";
import Image from "next/image";

const GeneratePage: NextPage = () => {
  const [form, setForm] = useState({
    prompt: "",
  });

  const [imageUrl, setImageUrl] = useState("");

  const generateIcon = api.generate.generateIcon.useMutation({
    onSuccess(data) {
      if (!data.imageUrl) return;
      setImageUrl(data.imageUrl);
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateIcon.mutate({
      prompt: form.prompt,
    });
    setForm({ prompt: "" });
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

        <Image
          src={`data:image/png;base64,${imageUrl}`}
          alt="image"
          width="100"
          height="100"
        />
      </main>
    </>
  );
};

export default GeneratePage;
