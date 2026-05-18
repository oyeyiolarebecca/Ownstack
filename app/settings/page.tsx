import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
    return (
        <main className="
      min-h-screen
      bg-gradient-to-br
      from-[#F8FAFC]
      to-lime-50
      flex">

            <Sidebar />

            <div className="flex-1 p-8">

                {/* HEADER */}
                <div>
                    <p className="text-slate-500">
                        Account preferences
                    </p>

                    <h1 className="text-4xl font-bold text-[#0F172A] mt-2">
                        Settings
                    </h1>
                </div>

                {/* SETTINGS CARD */}
                <div
                    className="
            mt-10
            bg-white/80
            backdrop-blur-md
            border
            border-white
            rounded-[32px]
            p-8
            shadow-sm
            max-w-3xl
          "
                >

                    <div className="space-y-8">

                        {/* BUSINESS NAME */}
                        <div>
                            <label className="text-sm font-medium text-[#0F172A]">
                                Business Name
                            </label>

                            <input
                                type="text"
                                defaultValue="OwnStack"
                                className="
                  w-full
                  mt-3
                  border
                  border-gray-200
                  rounded-2xl
                  px-5
                  py-4
                  outline-none
                  bg-white
                  text-black
                  focus:border-lime-400
                  focus:ring-4
                  focus:ring-lime-100
                "
                            />
                        </div>

                        {/* LIGHTNING ADDRESS */}
                        <div>
                            <label className="text-sm font-medium text-[#0F172A]">
                                Lightning Address
                            </label>

                            <input
                                type="text"
                                defaultValue="ownstack@getalby.com"
                                className="
                  w-full
                  mt-3
                  border
                  border-gray-200
                  rounded-2xl
                  px-5
                  py-4
                  outline-none
                  bg-white
                  text-black
                  focus:border-lime-400
                  focus:ring-4
                  focus:ring-lime-100
                "
                            />
                        </div>

                        {/* BUTTON */}
                        <button
                            className="
                bg-black
                hover:bg-[#111111]
                text-white
                transition
                px-6
                py-4
                rounded-3xl
                font-semibold
              "
                        >
                            Save Changes
                        </button>

                    </div>

                </div>

            </div>

        </main>
    );
}