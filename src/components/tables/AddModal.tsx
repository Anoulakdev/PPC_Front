// components/modals/AddModal.tsx
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export default function AddModal({ isOpen, onClose, onAdd }: AddModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Address
          </h4>
        </div>
        <form className="flex flex-col">
          <div className="custom-scrollbar overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Country</Label>
                <Input type="text" />
              </div>

              <div>
                <Label>City/State</Label>
                <Input type="text" />
              </div>

              <div>
                <Label>Postal Code</Label>
                <Input type="text" />
              </div>

              <div>
                <Label>TAX ID</Label>
                <Input type="text" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              ປິດ
            </Button>
            <Button size="sm" onClick={onAdd}>
              ເພີ່ມຂໍ້ມູນ
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
