"use client";
import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  id: number | null;
}

type Order = {
  id: number;
  user: {
    name: string;
    role: string;
  };
  projectName: string;
  budget: string;
  status: string;
};

const mockData: Order[] = [
  {
    id: 1,
    user: { name: "Lindsey Curtis", role: "Web Designer" },
    projectName: "Agency Website",
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: { name: "Kaiya George", role: "Project Manager" },
    projectName: "Technology",
    budget: "24.9K",
    status: "Pending",
  },
];

export default function EditModal({
  isOpen,
  onClose,
  onUpdate,
  id,
}: EditModalProps) {
  const [data, setData] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen && id != null) {
      const record = mockData.find((item) => item.id === id); // แทนด้วย fetch(`/api/order/${id}`) ได้

      if (record) {
        setData(record);
      }
    }
  }, [id, isOpen]);

  if (!isOpen || !data) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setData((prev) => {
      if (name === "userName") {
        return {
          ...prev!,
          user: {
            ...prev!.user,
            name: value,
          },
        };
      } else {
        return {
          ...prev!,
          [name]: value,
        };
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Project
          </h4>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>User Name</Label>
                <Input
                  type="text"
                  value={data.user?.name || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Project Name</Label>
                <Input
                  type="text"
                  value={data.projectName || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Budget</Label>
                <Input
                  type="text"
                  value={data.budget || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Input
                  type="text"
                  value={data.status || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              ປິດ
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onUpdate();
                // console.log("Updated values:", {
                //   id,
                //   name,
                //   projectName,
                //   budget,
                //   status,
                // });
              }}
            >
              ອັບເດດ
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
