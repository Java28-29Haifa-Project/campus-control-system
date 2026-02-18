
import React, { useEffect, useMemo, useCallback } from "react";
import type {AdminUser, UserRole} from "../../types/authTypes.ts";
import {useAppDispatch, useAppSelector} from "../../state/hooks.ts";
import {changeUserRoleThunk, fetchAllUsersThunk} from "../../state/slices/userSlice.ts";
import type {ColumnDef} from "@tanstack/react-table";
import TableTanStack from "../../components/TableTanStack.tsx";


const ROLE_OPTIONS: UserRole[] = [
    "USER",
    "SUPPORT",
    "ENGINEER",
    "ADMIN",
];

const formatDt = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "";

const UserAdminTable: React.FC = () => {
    const dispatch = useAppDispatch();

    const { items, updatingById } = useAppSelector(
        (s) => s.userAdmin
    );

    useEffect(() => {
        dispatch(fetchAllUsersThunk());
    }, [dispatch]);

    useEffect(() => {
        console.log("users[0] = ", items[0]);
    }, [items]);


    const handleRoleChange = useCallback(
        (user: AdminUser, newRole: UserRole) => {
            if (user.role === newRole) return;

            dispatch(
                changeUserRoleThunk({
                    id: user.user_id,
                    role: newRole,
                })
            );
        },
        [dispatch]
    );

    const columns = useMemo<ColumnDef<AdminUser>[]>(() => [
        {
            header: "ID",
            accessorFn: (row) => row.user_id ?? (row ).user_id ?? "",
            minSize:300,
            cell: ({ getValue }) => {
                const v = String(getValue() ?? "");
                if (!v) return "—";
                return v;
            },
        },
        {
            header: "Name",
            accessorKey: "username",
            minSize:300,
            cell: ({ getValue }) => {
                const v = String(getValue() ?? "");
                if (!v) return "—";
                return v;
            },
        },
        {
            header: "Email",
            accessorKey: "email",
            minSize:400,
            cell: ({ getValue }) => String(getValue() ?? "—")
        },
        {
            header: "Role",
            accessorKey: "role",
            minSize:400,
            cell: ({ row }) => {
                const user = row.original;
                const updating =
                    updatingById[user.user_id] ?? false;

                return (
                    <select
                        value={user.role}
                        disabled={updating}
                        onChange={(e) =>
                            handleRoleChange(
                                user,
                                e.target.value as UserRole
                            )
                        }
                    >
                        {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                );
            },
        },

        {
            header: "Updated",
            accessorKey: "updatedAt",
            minSize:400,
            cell: ({ getValue }) =>
                formatDt(getValue<string>()),
        },
    ], [handleRoleChange, updatingById]);

    return (
        <TableTanStack<AdminUser>
            data={items}
            columns={columns}
            title="User Management"
        />
    );
};

export default UserAdminTable;
