// app/dashboard/customer/work/[id]/Work.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createWorkDetailsService, getClientWorkService, getEmployeesByDomain } from '@/service/customer/work';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Calendar, Users, User, X } from 'lucide-react';
import { getCustomerProjectCycleService, removeEmployee } from '@/service/customer';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ClientWork = ({ customerId }) => {
    const [selectedDomain, setSelectedDomain] = useState('');
    const [loadingEmployeeList, setLoadingEmployeeList] = useState(true);
    const [employeeList, setEmployeeList] = useState([]);
    const [buttonDisable, setButtonDisable] = useState(false);
    const [workDetailLoading, setWorkDetailLoading] = useState(true);
    const [workDetailData, setWorkDetailData] = useState({});
    const [selectedEmployee, setSelectedEmployee] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectCycleData, setProjectCycleData] = useState(null);
    const [asignEmployee, setAsignEmployee] = useState(false);
    const router = useRouter();

    function handleSelectEmployee(employeeId) {
        setSelectedEmployee((prevSelected) => {
            const isSelected = prevSelected.includes(employeeId);
            if (isSelected) {
                return prevSelected.filter((id) => id !== employeeId);
            } else {
                return [...prevSelected, employeeId];
            }
        });
    }

    async function handleCreateWork() {
        setButtonDisable(true);
        try {
            if (selectedEmployee.length <= 0) {
                toast.error('Select at least one employee');
                return;
            }

            const formData = {
                employeeId: selectedEmployee,
                projectId: selectedProject,
                clientId: customerId,
                department: selectedDomain,
                startedAt: new Date().toISOString(),
                progressPercentage: {
                    departmentType: selectedDomain,
                    completeField: 0,
                    totalField: 0,
                },
            };

            const res = await createWorkDetailsService(formData);
            if (res.success) {
                toast.success('Client assigned successfully');
                setSelectedEmployee([]);
                setSelectedDomain('');
                setEmployeeList([]);
                router.push(`/dashboard/customer`);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Error while client Assignment');
        } finally {
            setButtonDisable(false);
        }
    }

    useEffect(() => {
        async function fetchEmployeeByDomain() {
            try {
                if (selectedDomain !== '') {
                    const res = await getEmployeesByDomain(selectedDomain);
                    if (res?.success) {
                        setLoadingEmployeeList(false);
                        toast.success('Employee Details fetched' || '');
                        setEmployeeList(res.data);
                    }
                }
            } catch (error) {
                console.log(error);
                setEmployeeList([]);
                toast.error(error?.response?.data?.message || 'Error while fetching employee');
            }
        }

        fetchEmployeeByDomain();
    }, [selectedDomain]);

    async function fetchClientWork() {
        try {
            if (customerId) {
                const res = await getClientWorkService(customerId);
                // console.log(res, "res");
                if (res.success) {
                    setWorkDetailLoading(false);
                    console.log(res.data);
                    setWorkDetailData(res.data);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message || 'Error while fetching client work details');
        }
    }

    useEffect(() => {
        fetchCustomerProjectCycle();
        fetchClientWork();
    }, []);

    async function fetchCustomerProjectCycle() {
        try {
            const response = await getCustomerProjectCycleService(customerId);
            if (response.success) {
                setProjectCycleData(response.data);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const handleClick = (e) => {
        const domainMap = {
            seo: 'SEO',
            'web-dev': 'WEB_DEVELOPER',
            'social-media': 'SOCIAL_MEDIA',
            ads: 'ADS_MANAGER',
        };

        setSelectedDomain(domainMap[e] || 'OTHER');
    };

    const handleRemoveEmployee = async (projectDurationId, employeeId) => {
        const confirmed = window.confirm('Are you sure you want to remove this employee from the project?');

        if (!confirmed) return;

        try {
            setButtonDisable(true);
            const res = await removeEmployee(projectCycleData.projectCycle._id, projectDurationId, employeeId);
            if (res.success) {
                toast.success(res.message);
                fetchCustomerProjectCycle();
                fetchClientWork();
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || 'Something went wrong');
        } finally {
            setButtonDisable(false);
        }
    };

    console.log(workDetailData?.workDetails);

    return (
        <div className="flex flex-col gap-8 lg:flex-row">
            <div className="w-full lg:w-1/3">
                <div className="flex flex-col gap-5">
                    {/* <div>
            <p className="text-lg font-medium mb-2">Domains of Work</p>
            <Select onValueChange={(value) => setSelectedDomain(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEO">Seo</SelectItem>
                <SelectItem value="WEB_DEVELOPER">
                  Website Development
                </SelectItem>
                <SelectItem value="ADS_MANAGER">Ads Management</SelectItem>
                <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            {loadingEmployeeList ? (
              <div className="w-full border-2 p-10 border-dashed rounded-xl flex items-center justify-center">
                <p className=" text-gray-400">Select one Domain</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {employeeList.length > 0 ? (
                  employeeList.map((employee) => (
                    <button
                      onClick={() => handleSelectEmployee(employee?._id)}
                      key={employee?._id}
                      className={`${selectedEmployee.includes(employee?._id)
                        ? "bg-emerald-100 border-emerald-400"
                        : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300"
                        } border p-4 rounded-lg shadow-sm bg-white w-full`}
                    >
                      <p className="font-semibold text-lg">
                        {employee?.basicDetails?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {employee?.employeeId}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">No employees found</p>
                )}
              </div>
            )}
          </div> */}

                    <div>
                        <div className="flex flex-col gap-3">
                            {projectCycleData?.projectCycle?.projectDuration?.length > 0 ? (
                                projectCycleData?.projectCycle?.projectDuration?.map((project) => (
                                    <div key={project._id} className={`w-full rounded-lg border bg-white p-4 shadow-sm`}>
                                        <div className="flex justify-between">
                                            <p className="text-lg font-semibold">{project?.projectName}</p>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button
                                                        onClick={() => {
                                                            handleClick(project?.service);
                                                            setSelectedProject(project._id);
                                                        }}
                                                        className="rounded-md border bg-gray-100 p-2 text-black hover:bg-gray-200"
                                                    >
                                                        <User size={18} />
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Asign Employee</DialogTitle>
                                                    </DialogHeader>
                                                    {employeeList.length > 0 ? (
                                                        employeeList.map((employee) => (
                                                            <button
                                                                onClick={() => handleSelectEmployee(employee?._id)}
                                                                key={employee?._id}
                                                                className={`${
                                                                    selectedEmployee.includes(employee?._id)
                                                                        ? 'border-emerald-400 bg-emerald-100'
                                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                                                } w-full rounded-lg border bg-white p-4 shadow-sm`}
                                                            >
                                                                <p className="text-lg font-semibold">{employee?.basicDetails?.name}</p>
                                                                <p className="text-sm text-gray-500">{employee?.employeeId}</p>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500">No employees found</p>
                                                    )}
                                                    <Button disabled={buttonDisable} className={'mt-2 w-full'} onClick={handleCreateWork}>
                                                        Assign client
                                                    </Button>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <p className="flex text-sm font-medium text-gray-600">
                                            {project?.service}
                                            {project?.serviceType && <p className="font-normal">&nbsp;- {project?.serviceType}</p>}
                                        </p>
                                        {project.employeeId.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-4">
                                                {project.employeeId?.map((item) => (
                                                    <div key={item?._id} className="flex items-center gap-2 rounded-md border p-2 text-xs text-black">
                                                        <Users className="h-4 w-4" />
                                                        <span className="capitalize">{item?.basicDetails?.name}</span>
                                                        <button
                                                            onClick={() => handleRemoveEmployee(project._id, item._id)}
                                                            className="transition hover:text-red-600"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="mt-10 text-center text-gray-500">No Project History Found</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-2/3">
                {workDetailLoading ? (
                    <Loading />
                ) : (
                    <div className="">
                        <div className="w-full">
                            <h3 className="mb-3 text-lg font-semibold">Work History</h3>
                            <div className="flex flex-col gap-3">
                                {workDetailData?.workDetails?.map((work, index) => {
                                    const completedTasks = work.checklist?.filter((t) => t.completed).length || 0;
                                    const totalTasks = work.checklist?.length || 0;

                                    return (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
                                        >
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <span className="block font-semibold text-gray-900">{work.department?.replace('_', ' ')}</span>
                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>{new Date(work.startedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        work.status === 'COMPLETED'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : work.status === 'IN_PROGRESS'
                                                              ? 'bg-blue-50 text-blue-700'
                                                              : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {work.status?.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Progress Section */}
                                                <div>
                                                    <div className="mb-1.5 flex justify-between text-sm">
                                                        <span className="text-xs font-medium text-gray-600">Progress</span>
                                                        {/* <span className="text-xs font-medium text-gray-900">
                              {work.progressPercentage}%
                            </span> */}
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                                        <div
                                                            className="h-full rounded-full bg-black transition-all duration-500"
                                                            style={{ width: `${work.progressPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Checklist Summary */}
                                                <div className="border-t border-gray-100 pt-3">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-xs font-medium text-gray-500">Recent Activity</span>
                                                        <span className="text-xs text-gray-400">
                                                            {work?.progressPercentage?.completeField}/{work?.progressPercentage?.totalField} Tasks
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                                        {work.checklist
                                                            ?.filter((t) => t.completed)
                                                            .map((item, i) => (
                                                                <div key={i} className="flex items-start gap-2">
                                                                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                                                    <span className="line-clamp-1 text-xs text-gray-600" title={item.label}>
                                                                        {item.label}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        {completedTasks === 0 && (
                                                            <p className="col-span-full text-xs text-gray-400 italic">No completed tasks yet</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="flex flex-wrap gap-4">
                                                    {work.employeeId?.map((item) => (
                                                        <div key={item?._id} className="flex items-center gap-1.5 pt-2 text-xs text-black">
                                                            <Users className="h-3.5 w-3.5" />
                                                            <span className="capitalize">{item?.basicDetails?.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!workDetailData?.workDetails || workDetailData.workDetails.length === 0) && (
                                    <p className="text-sm text-gray-500">No work history found</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientWork;
