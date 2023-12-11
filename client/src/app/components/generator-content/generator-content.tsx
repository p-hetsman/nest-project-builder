import { useState } from "react";
import { Button, Checkbox, Input } from "@nextui-org/react";
import { handleSubmit, isValidProjectName } from "./validtion-helper";
import { checkboxList, initFormState } from "./generator-constants";


export default function SubmitForm() {
  const [formData, setFormData] = useState(initFormState);
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const { projectName } = formData;
  const [checkboxStates, setCheckboxStates] = useState(
    checkboxList.reduce((acc, item) => ({ ...acc, [item.name]: false }), {})
  );


  const submission = (e) => {
    handleSubmit(e, formData);
    setFormData(initFormState);
    setCheckboxStates(checkboxList.reduce((acc, item) => ({ ...acc, [item.name]: false }), {}))
  }

  const handleChange = (event) => {
    setButtonDisabled(true);

    if (!isValidProjectName(projectName)) {
      setButtonDisabled(false);
    }

    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    setCheckboxStates((prevState) => ({
      ...prevState,
      [name]: checked,
    }));

    if (name === "projectName") {
      if (!isValidProjectName(newValue)) {
        setButtonDisabled(false);
      }
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: newValue,
    }));

  };

  return (
    < div>
      <br />
      <form onSubmit={submission} className="flex flex-col  gap-4 "  >
        <Input
          autoComplete="off"
          type="text"
          name="projectName"
          placeholder="Enter your project name"
          label="Project Name:"
          variant="bordered"
          isInvalid={!isValidProjectName(projectName)}
          color={!isValidProjectName(projectName) ? "danger" : "success"}
          errorMessage={!isValidProjectName(projectName) && "Please enter a valid project name"}
          onChange={(e) => handleChange(e)}
          value={projectName}
        />

        {checkboxList.map((item) => (
          <div key={item.name}>
            <Checkbox size="lg" key={item.name}
              type="checkbox"
              name={item.name}
              onChange={(e) => handleChange(e)}
              value={formData[item.name]}
              isSelected={checkboxStates[item.name]}
            >
              {item.label}
            </Checkbox>
          </div>
        ))}

        <Button type="submit" isDisabled={!isButtonDisabled} color="primary">
          Submit
        </Button>
      </form>
    </div>
  );
}
